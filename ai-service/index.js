const express = require("express");
const Groq = require("groq-sdk");
const OpenAI = require("openai");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(express.json());

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.post("/triage", async (req, res) => {
  const { description } = req.body;

  if (!groq) {
    console.warn("Groq API Key missing. Using Mock AI Triage Mode.");

    // Mock Triage Logic for Hackathon Prototype
    const mockTriage = {
      classification: description.toLowerCase().includes("fire")
        ? "FIRE"
        : description.toLowerCase().includes("medical")
          ? "MEDICAL"
          : "SECURITY",
      severity:
        description.toLowerCase().includes("urgent") ||
        description.toLowerCase().includes("fire")
          ? "CRITICAL"
          : "MEDIUM",
      summary: `Potential ${description.toLowerCase().includes("fire") ? "fire" : description.toLowerCase().includes("medical") ? "medical" : "security"} incident requiring immediate attention.`,
      response_protocol: [
        "Assess immediate danger",
        "Notify nearest staff members",
        "Coordinate evacuation if necessary",
        "Maintain communication with control center",
      ],
      recommended_roles: ["SECURITY", "STAFF"],
    };

    return res.json({ triage: mockTriage });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an AI Triage Engine for a hospitality emergency response system. Your goal is to analyze the incident, classify it, and provide a response protocol. Return ONLY a JSON object with no markdown formatting. The JSON must contain exactly these fields: classification (FIRE, MEDICAL, SECURITY, etc.), severity (LOW, MEDIUM, HIGH, CRITICAL), summary (a concise one-line summary of the analysis), response_protocol (array of step-by-step string instructions), and recommended_roles (e.g., [\"SECURITY\", \"MEDICAL_STAFF\"]).",
        },
        {
          role: "user",
          content: `Triage this emergency: ${description}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    let triageData = chatCompletion.choices[0]?.message?.content;
    try {
      triageData = JSON.parse(triageData);
    } catch (e) {
      console.error("Failed to parse Groq JSON response", e);
    }

    res.json({ triage: triageData });
  } catch (error) {
    console.error("Groq Triage Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/transcribe", upload.single("file"), async (req, res) => {
  if (!openai) {
    return res.status(500).json({
      error: "OpenAI (Whisper) not configured. Please add OPENAI_API_KEY to .env",
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No audio file provided." });
  }

  const filePath = req.file.path;

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    // Clean up the temporary file
    fs.unlinkSync(filePath);

    res.json({ text: transcription.text });
  } catch (error) {
    console.error("Whisper Transcription Error:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
