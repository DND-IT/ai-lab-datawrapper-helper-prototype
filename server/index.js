import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATAWRAPPER_API_KEY = process.env.DATAWRAPPER_API_KEY || "";

const SYSTEM_PRESETS = {
  tamedia: { theme: "tagesanzeiger", folderId: 407746, organizationId: "tagesanzeiger" },
  fuw: { theme: "fuw", folderId: 407748, organizationId: "fuw" },
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "50mb" }));

  // --- API Routes ---

  app.get("/api/config", (req, res) => {
    res.json({
      geminiApiKey: process.env.GEMINI_API_KEY || "",
    });
  });

  app.get("/api/diagnostic", async (req, res) => {
    try {
      const val = process.env.GEMINI_API_KEY || "";
      const results = {
        geminiKeySet: !!val,
        geminiKeyValue:
          val.length > 5
            ? val.substring(0, 5) + "..." + val.substring(val.length - 4)
            : val,
        geminiKeyLength: val.length,
        potentialGoogleKeys: Object.keys(process.env).filter((k) => {
          const v = process.env[k];
          return (
            v &&
            typeof v === "string" &&
            (v.startsWith("AIza") || k.toLowerCase().includes("google"))
          );
        }),
        datawrapperStatus: "unknown",
      };

      try {
        const dwRes = await fetch("https://api.datawrapper.de/v3/me", {
          headers: { Authorization: `Bearer ${DATAWRAPPER_API_KEY}` },
        });
        if (dwRes.ok) {
          results.datawrapperStatus = "ok";
        } else {
          results.datawrapperStatus = `error: ${dwRes.status} ${await dwRes.text()}`;
        }
      } catch (dwErr) {
        results.datawrapperStatus = "error: " + dwErr.message;
      }

      return res.json(results);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/create-dw-chart", async (req, res) => {
    try {
      const {
        title,
        chartType,
        csvData,
        intro,
        source,
        byline,
        language,
        chartId: existingChartId,
        system,
      } = req.body;

      if (!title || !chartType || !csvData) {
        return res
          .status(400)
          .json({ error: "Missing title, chartType, or csvData" });
      }

      const preset = SYSTEM_PRESETS[system] || SYSTEM_PRESETS.tamedia;
      console.log(`\n--- DW: system=${system || "tamedia (default)"} -> theme=${preset.theme}${preset.folderId ? `, folderId=${preset.folderId}` : ""}${preset.organizationId ? `, organizationId=${preset.organizationId}` : ""} ---`);

      let chartId;

      if (existingChartId) {
        // Update existing chart instead of creating a new one
        console.log(`\n--- DW: Reusing existing chart ${existingChartId} ---`);
        chartId = existingChartId;
      } else {
        // 1. Create Chart
        const createBody = {
          title,
          type: chartType,
          theme: preset.theme,
          language: language || "fr-FR",
          metadata: {
            describe: {
              intro: intro || "",
              "source-name": source || "",
              byline: byline || "",
            },
            visualize: {
              "base-color": "#378EBD",
            },
          },
        };
        if (preset.organizationId) createBody.organizationId = preset.organizationId;
        if (preset.folderId) createBody.folderId = preset.folderId;
        console.log("\n--- DW: CREATE chart ---");
        console.log("  POST https://api.datawrapper.de/v3/charts");
        console.log("  Body:", JSON.stringify(createBody, null, 2));

        const dwCreateRes = await fetch("https://api.datawrapper.de/v3/charts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DATAWRAPPER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createBody),
        });

        if (!dwCreateRes.ok) {
          const errText = await dwCreateRes.text();
          console.log("  Response:", dwCreateRes.status, errText);
          if (dwCreateRes.status === 401) {
            throw new Error("Invalid Datawrapper API key");
          }
          throw new Error(`Datawrapper create failed: ${errText}`);
        }

        const dwCreateData = await dwCreateRes.json();
        chartId = dwCreateData.id;
        console.log("  Response:", dwCreateRes.status, "-> chartId:", chartId);
      }

      // 2. Patch Chart Metadata
      const patchMetadata = {
        describe: {
          intro: intro || "",
          "source-name": source || "",
          byline: byline || "",
        },
        visualize: {
          "base-color": "#378EBD",
        },
      };

      if (chartType === "locator-map") {
        patchMetadata.data = { json: true };
        if (!patchMetadata.visualize) patchMetadata.visualize = {};
        patchMetadata.visualize.scale = true;
        patchMetadata.visualize.mapStyles = { labels: false };

        try {
          const parsedData = JSON.parse(csvData);
          if (
            parsedData &&
            parsedData.markers &&
            parsedData.markers.length > 0
          ) {
            let minLon = Infinity;
            let maxLon = -Infinity;
            let minLat = Infinity;
            let maxLat = -Infinity;

            parsedData.markers.forEach((m) => {
              if (m.coordinates && m.coordinates.length === 2) {
                const lon = parseFloat(m.coordinates[0]);
                const lat = parseFloat(m.coordinates[1]);
                if (!isNaN(lon) && !isNaN(lat)) {
                  if (lon < minLon) minLon = lon;
                  if (lon > maxLon) maxLon = lon;
                  if (lat < minLat) minLat = lat;
                  if (lat > maxLat) maxLat = lat;
                }
              }
            });

            if (
              minLon !== Infinity &&
              maxLon !== -Infinity &&
              minLat !== Infinity &&
              maxLat !== -Infinity
            ) {
              const avgLon = (minLon + maxLon) / 2;
              const avgLat = (minLat + maxLat) / 2;

              if (
                Math.abs(maxLon - minLon) < 0.001 &&
                Math.abs(maxLat - minLat) < 0.001
              ) {
                patchMetadata.visualize.view = {
                  center: [avgLon, avgLat],
                  zoom: 9,
                };
              } else {
                patchMetadata.visualize.view = {
                  fit: {
                    top: [avgLon, maxLat],
                    bottom: [avgLon, minLat],
                    left: [minLon, avgLat],
                    right: [maxLon, avgLat],
                  },
                };
              }
            }
          }
        } catch (e) {
          console.log("Could not auto-fit locator map bounds", e);
        }
      }

      const patchBody = {
        title,
        type: chartType,
        language: language || "fr-FR",
        metadata: patchMetadata,
      };
      console.log("\n--- DW: PATCH chart metadata ---");
      console.log(`  PATCH https://api.datawrapper.de/v3/charts/${chartId}`);
      console.log("  Body:", JSON.stringify(patchBody, null, 2));

      const dwPatchRes = await fetch(
        `https://api.datawrapper.de/v3/charts/${chartId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${DATAWRAPPER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchBody),
        }
      );

      if (!dwPatchRes.ok) {
        const patchErr = await dwPatchRes.text();
        console.log("  Response:", dwPatchRes.status, patchErr);
      } else {
        console.log("  Response:", dwPatchRes.status, "OK");
      }

      // 3. Upload Data
      const contentType =
        chartType === "locator-map" ? "application/json" : "text/csv";

      console.log("\n--- DW: UPLOAD data ---");
      console.log(`  PUT https://api.datawrapper.de/v3/charts/${chartId}/data`);
      console.log(`  Content-Type: ${contentType}`);
      console.log(`  Data (${csvData.length} chars):`);
      console.log("  " + csvData.substring(0, 500) + (csvData.length > 500 ? "\n  ... (truncated)" : ""));

      const dwDataRes = await fetch(
        `https://api.datawrapper.de/v3/charts/${chartId}/data`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${DATAWRAPPER_API_KEY}`,
            "Content-Type": contentType,
          },
          body: csvData,
        }
      );

      if (!dwDataRes.ok) {
        const dataErr = await dwDataRes.text();
        console.log("  Response:", dwDataRes.status, dataErr);
        throw new Error(`Datawrapper data upload failed: ${dataErr}`);
      }
      console.log("  Response:", dwDataRes.status, "OK");

      // 4. Publish Chart
      console.log("\n--- DW: PUBLISH chart ---");
      console.log(`  POST https://api.datawrapper.de/v3/charts/${chartId}/publish`);

      const dwPublishRes = await fetch(
        `https://api.datawrapper.de/v3/charts/${chartId}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DATAWRAPPER_API_KEY}`,
          },
        }
      );

      let publicVersion = 1;
      try {
        if (dwPublishRes.ok) {
          const publishData = await dwPublishRes.json();
          console.log("  Response:", dwPublishRes.status, JSON.stringify(publishData, null, 2));
          publicVersion =
            publishData?.data?.publicVersion ||
            publishData?.publicVersion ||
            publishData?.data?.publicId ||
            1;
        } else {
          console.log("  Response:", dwPublishRes.status, await dwPublishRes.text());
        }
      } catch (e) {
        console.log("  Response: could not parse publish response");
      }

      const publicUrl = `https://datawrapper.dwcdn.net/${chartId}/${publicVersion}/`;

      const result = {
        success: true,
        chartId,
        publicUrl,
        iframeCode: `<iframe title="${title}" aria-label="Chart" id="datawrapper-chart-${chartId}" src="${publicUrl}" scrolling="no" frameborder="0" style="width: 0; min-width: 100% !important; border: none;" height="400" data-external="1"></iframe>`,
      };
      console.log("\n--- DW: DONE ---");
      console.log(`  Chart ID: ${chartId}`);
      console.log(`  Public URL: ${publicUrl}`);

      return res.json(result);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: error.message || "Internal server error" });
    }
  });

  // --- Serve pre-built frontend ---
  const publicDir = path.join(__dirname, "..", "public");
  app.use(express.static(publicDir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
