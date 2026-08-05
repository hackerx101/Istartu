import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "dummy_key",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // Use JSON middleware for API routes, but keep raw body for webhooks if needed
  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, imageBase64 } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      let response;
      const systemInstruction = "You are FSMEC AI Coach & Athletic Scouting Analyst. You provide verified training skills, drills routines, and real athlete research. When asked about a specific player or athlete, search for real, public web information about them and summarize accurately based on web summaries. Do not invent fake statistics, fake school names, or unverified claims. Do not lie. If a player is not found or details are sparse, state clearly what is verified vs unconfirmed.";
      
      if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [
            prompt,
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
          ],
          config: { 
            systemInstruction,
            tools: [{ googleSearch: {} }]
          }
        });
      } else {
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: { 
            systemInstruction,
            tools: [{ googleSearch: {} }]
          }
        });
      }

      if (response && response.text) {
        return res.json({ text: response.text });
      }
      throw new Error("No response text from model");
    } catch (err: any) {
      console.warn("AI Chat fallback active:", err?.message || err);
      // Fallback skills & drills responder
      const lower = (req.body?.prompt || "").toLowerCase();
      let reply = "Great question! Focus on athletic consistency, daily mechanical repetitions, and tracking your metric growth on FSMEC.";

      if (lower.includes('shoot') || lower.includes('shooting')) {
        reply = "🏀 **Basketball Shooting Drill Routine**:\n1. **Form Shooting**: 50 reps within 5 feet of the rim, focus on wrist extension and balance.\n2. **Spot-Up 3s**: 5 spots x 10 makes (Corner, Wing, Key, Wing, Corner).\n3. **Game Speed Pull-Ups**: 20 mid-range pull-ups coming off off-ball screens.";
      } else if (lower.includes('dribbl') || lower.includes('ball handl') || lower.includes('footwork')) {
        reply = "⚡ **Ball Handling & Footwork Routine**:\n1. **Pound Dribble Series**: High, knee, ankle-level (30 sec each hand).\n2. **Two-Ball Dribble Sync & Alternate**: 45 seconds continuous.\n3. **Cone Crossover Zig-Zag**: 5 reps full speed with change of direction.";
      } else if (lower.includes('soccer') || lower.includes('pass') || lower.includes('touch')) {
        reply = "⚽ **Soccer First-Touch & Passing Drills**:\n1. **Wall Rebound 1-Touch**: 100 passes using inside of left and right foot.\n2. **Cone Weave Dribbling**: Tight 1-yard cone weave using inside/outside soles.\n3. **Long Ball Accuracy**: Target 30-yard diagonal lofted passes.";
      } else if (lower.includes('speed') || lower.includes('agil') || lower.includes('jump')) {
        reply = "🏃 **Speed & Explosive Agility Workout**:\n1. **Ladder Fast Feet**: Ickey Shuffle & 2-in-2-out (4 sets).\n2. **Box Jumps**: 3 sets of 8 explosive vertical leaps.\n3. **10-Yard Sprints**: 6 reps with 45s rest focusing on low drive phase.";
      } else if (lower.includes('card') || lower.includes('profile') || lower.includes('scout')) {
        reply = "🏆 **Scouting & Player Card Tip**:\nTo get noticed by college scouts, upload high-definition game highlights and ensure your Player Card AI showcase badge is saved to your profile.";
      }

      res.json({ text: reply });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
