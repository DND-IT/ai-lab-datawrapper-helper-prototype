import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATAWRAPPER_API_KEY = process.env.DATAWRAPPER_API_KEY || "";

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
      } = req.body;

      if (!title || !chartType || !csvData) {
        return res
          .status(400)
          .json({ error: "Missing title, chartType, or csvData" });
      }

      let chartId;

      if (existingChartId) {
        // Update existing chart instead of creating a new one
        console.log(`Updating existing Datawrapper chart ${existingChartId}...`);
        chartId = existingChartId;
      } else {
        // 1. Create Chart
        console.log("Creating Datawrapper chart...");
        const dwCreateRes = await fetch("https://api.datawrapper.de/v3/charts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DATAWRAPPER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            type: chartType,
            theme: "tamedia-ohne-linien",
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
          }),
        });

        if (!dwCreateRes.ok) {
          if (dwCreateRes.status === 401) {
            throw new Error("Invalid Datawrapper API key");
          }
          throw new Error(
            `Datawrapper create failed: ${await dwCreateRes.text()}`
          );
        }

        const dwCreateData = await dwCreateRes.json();
        chartId = dwCreateData.id;
      }

      // 2. Patch Chart Metadata
      console.log("Patching chart metadata...");
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

      const dwPatchRes = await fetch(
        `https://api.datawrapper.de/v3/charts/${chartId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${DATAWRAPPER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            type: chartType,
            language: language || "fr-FR",
            metadata: patchMetadata,
          }),
        }
      );

      if (!dwPatchRes.ok) {
        console.warn(`Datawrapper patch failed: ${await dwPatchRes.text()}`);
      }

      // 3. Upload Data
      console.log("Uploading data to Datawrapper...");
      const contentType =
        chartType === "locator-map" ? "application/json" : "text/csv";

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
        throw new Error(
          `Datawrapper data upload failed: ${await dwDataRes.text()}`
        );
      }

      // 4. Publish Chart
      console.log("Publishing Datawrapper chart...");
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
          publicVersion =
            publishData?.data?.publicVersion ||
            publishData?.publicVersion ||
            publishData?.data?.publicId ||
            1;
        }
      } catch (e) {
        // fall through with default version
      }

      const publicUrl = `https://datawrapper.dwcdn.net/${chartId}/${publicVersion}/`;

      return res.json({
        success: true,
        chartId,
        publicUrl,
        iframeCode: `<iframe title="${title}" aria-label="Chart" id="datawrapper-chart-${chartId}" src="${publicUrl}" scrolling="no" frameborder="0" style="width: 0; min-width: 100% !important; border: none;" height="400" data-external="1"></iframe>`,
      });
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
