import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" });

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, imageBase64 } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let response;
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
        ],
      });
    } else {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
    }

    return res.status(200).json({ text: response.text });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to generate content" });
  }
}
