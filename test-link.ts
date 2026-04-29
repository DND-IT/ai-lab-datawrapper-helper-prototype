import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const DATAWRAPPER_API_KEY = "eGABpVcYHPfZgx4krm1LQh1mwM9QZ7G4qEWISVdDcozEPpcUuiteT8m2UhHTu3US";

async function simulate() {
  try {
      const text = "https://en.wikipedia.org/wiki/Demographics_of_Switzerland";
      const files: any[] = [];
      const parts: any[] = [];
      
      if (text) {
        parts.push({ text: `Context/Data: ${text}` });
      }
      
      const aiRes = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts },
        config: {
          systemInstruction: `You are a chart data generator. Based on the user's provided data (which may be text, JSON, links, images, or PDFs), extract the relevant information and generate accurate data for a chart.
          Provide a short title, select the best chart type, and format the data as a valid CSV string (including a header row). If the data is messy, organize it.
          
          Available Datawrapper chart types:
          - "d3-bars" (Bar chart)
          - "d3-bars-split" (Split bar chart)
          - "d3-bars-stacked" (Stacked bar chart)
          - "column-chart" (Column chart)
          - "grouped-column-chart" (Grouped column chart)
          - "stacked-column-chart" (Stacked column chart)
          - "d3-lines" (Line chart)
          - "d3-area" (Area chart)
          - "d3-pies" (Pie chart)
          - "d3-donuts" (Donut chart)
          - "d3-scatter-plot" (Scatter plot)`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A short, descriptive title for the chart.",
              },
              chartType: {
                type: Type.STRING,
                description: "The selected Datawrapper chart type string.",
              },
              csvData: {
                type: Type.STRING,
                description: "The complete CSV string representing the chart data.",
              },
            },
            required: ["title", "chartType", "csvData"],
          },
        },
      });

      console.log(aiRes.text);
  } catch(e) {
      console.log("ERROR", e);
  }
}

simulate();
