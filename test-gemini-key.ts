import { GoogleGenAI } from "@google/genai";
async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: "invalid" });
    await ai.models.generateContent({ model: "gemini-3.1-pro-preview", contents: "hi" });
  } catch(e: any) {
    console.log(e.message);
  }
}
test();
