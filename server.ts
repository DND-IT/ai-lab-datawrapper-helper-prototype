import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Use standard dotenv config with override
dotenv.config({ override: true });

const DATAWRAPPER_API_KEY = process.env.DATAWRAPPER_API_KEY || "Es3XqKUhWJmexi9e68TkwvpwegMlHSDdXyXsIGfahxSRAFLgz1S8JyhgN9V9OoWr";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for Datawrapper data routes
  app.use(express.json({ limit: "50mb" }));

  // Config API Route to give client the API key
  app.get("/api/config", (req, res) => {
    res.json({
      geminiApiKey: process.env.GEMINI_API_KEY || "",
    });
  });

  // Diagnostic API Route (Optional)
  app.get("/api/diagnostic", async (req, res) => {
    try {
      const val = process.env.GEMINI_API_KEY || "";
      const results: any = {
        geminiKeySet: !!val,
        geminiKeyValue: val.length > 5 ? val.substring(0, 5) + "..." + val.substring(val.length - 4) : val,
        geminiKeyLength: val.length,
        potentialGoogleKeys: Object.keys(process.env).filter(k => {
           const v = process.env[k];
           return v && typeof v === 'string' && (v.startsWith('AIza') || k.toLowerCase().includes('google'));
        }),
        datawrapperStatus: "unknown"
      };

      try {
        const dwRes = await fetch("https://api.datawrapper.de/v3/me", {
          headers: { "Authorization": `Bearer ${DATAWRAPPER_API_KEY}` }
        });
        if (dwRes.ok) {
          results.datawrapperStatus = "ok";
        } else {
          results.datawrapperStatus = `error: ${dwRes.status} ${await dwRes.text()}`;
        }
      } catch (dwErr: any) {
        results.datawrapperStatus = "error: " + dwErr.message;
      }

      return res.json(results);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // API Route to submit the already-structured data to Datawrapper
  app.post("/api/create-dw-chart", async (req, res) => {
    try {
      const { title, chartType, csvData, intro, source, byline, language } = req.body;
      
      if (!title || !chartType || !csvData) {
         return res.status(400).json({ error: "Missing title, chartType, or csvData" });
      }

      // 1. Create Chart in Datawrapper (Only title, type, theme)
      console.log("Creating Datawrapper chart...");
      const dwCreateRes = await fetch("https://api.datawrapper.de/v3/charts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DATAWRAPPER_API_KEY}`,
          "Content-Type": "application/json"
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
              byline: byline || ""
            },
            visualize: {
              "base-color": "#378EBD"
            }
          }
        })
      });

      if (!dwCreateRes.ok) {
        if (dwCreateRes.status === 401) {
          throw new Error("Invalid Datawrapper API key");
        }
        throw new Error(`Datawrapper create failed: ${await dwCreateRes.text()}`);
      }

      const dwCreateData = await dwCreateRes.json();
      const chartId = dwCreateData.id;

      // 1.5. Patch Chart Metadata
      console.log("Patching chart metadata...");
      const patchMetadata: any = {
        describe: {
          intro: intro || "",
          "source-name": source || "",
          byline: byline || ""
        },
        visualize: {
          "base-color": "#378EBD"
        }
      };

      if (chartType === "locator-map") {
         patchMetadata.data = { json: true };
         if (!patchMetadata.visualize) patchMetadata.visualize = {};
         patchMetadata.visualize.scale = true;
         // Disable map labels completely as requested
         patchMetadata.visualize.mapStyles = { labels: false };
         
         try {
           const parsedData = JSON.parse(csvData);
           if (parsedData && parsedData.markers && parsedData.markers.length > 0) {
             let minLon = Infinity;
             let maxLon = -Infinity;
             let minLat = Infinity;
             let maxLat = -Infinity;
             
             parsedData.markers.forEach((m: any) => {
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
             
             if (minLon !== Infinity && maxLon !== -Infinity && minLat !== Infinity && maxLat !== -Infinity) {
               const avgLon = (minLon + maxLon) / 2;
               const avgLat = (minLat + maxLat) / 2;
               
               // If there is only one point, zoom in on it instead of fitting to a tiny box.
               // For single points or very close points, just set a reasonable center and a good default zoom.
               if (Math.abs(maxLon - minLon) < 0.001 && Math.abs(maxLat - minLat) < 0.001) {
                   patchMetadata.visualize.view = {
                       center: [avgLon, avgLat],
                       zoom: 9 
                   };
               } else {
                   patchMetadata.visualize.view = {
                       fit: {
                           top: [avgLon, maxLat],
                           bottom: [avgLon, minLat],
                           left: [minLon, avgLat],
                           right: [maxLon, avgLat]
                       }
                   };
               }
             }
           }
         } catch(e) {
           console.log("Could not auto-fit locator map bounds", e);
         }
      }

      const dwPatchRes = await fetch(`https://api.datawrapper.de/v3/charts/${chartId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${DATAWRAPPER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language: language || "fr-FR",
          metadata: patchMetadata
        })
      });

      if (!dwPatchRes.ok) {
        console.warn(`Datawrapper patch failed: ${await dwPatchRes.text()}`);
      }

      // 2. Upload Data (CSV or JSON depending on chartType)
      console.log("Uploading data to Datawrapper...");
      const contentType = chartType === "locator-map" ? "application/json" : "text/csv";
      
      const dwDataRes = await fetch(`https://api.datawrapper.de/v3/charts/${chartId}/data`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${DATAWRAPPER_API_KEY}`,
          "Content-Type": contentType
        },
        body: csvData
      });

      if (!dwDataRes.ok) {
        throw new Error(`Datawrapper data upload failed: ${await dwDataRes.text()}`);
      }

      // 3. Publish Chart
      console.log("Publishing Datawrapper chart...");
      const publishRes = await fetch(`https://api.datawrapper.de/v3/charts/${chartId}/publish`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DATAWRAPPER_API_KEY}`
        }
      });

      const publicUrl = `https://datawrapper.dwcdn.net/${chartId}/1/`;

      return res.json({
        success: true,
        chartId,
        publicUrl,
        iframeCode: `<iframe title="${title}" aria-label="Chart" id="datawrapper-chart-${chartId}" src="${publicUrl}" scrolling="no" frameborder="0" style="width: 0; min-width: 100% !important; border: none;" height="400" data-external="1"></iframe>`
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // For production
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
