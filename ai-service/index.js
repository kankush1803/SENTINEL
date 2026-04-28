const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.post("/triage", async (req, res) => {
  const { description } = req.body;

  if (!anthropic) {
    console.warn("Anthropic API Key missing. Using Mock AI Triage Mode.");

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
    const msg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      system:
        "You are an AI Triage Engine for a hospitality emergency response system. Your goal is to analyze the incident, classify it, and provide a response protocol. Return a JSON object with: classification (FIRE, MEDICAL, SECURITY, etc.), severity (LOW, MEDIUM, HIGH, CRITICAL), response_protocol (step-by-step instructions), and recommended_roles (e.g., [SECURITY, MEDICAL_STAFF]).",
      messages: [
        { role: "user", content: `Triage this emergency: ${description}` },
      ],
    });

    // Attempt to extract JSON from Claude's response if it's wrapped in text
    let triageData = msg.content[0].text;
    try {
      const jsonMatch = triageData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        triageData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse Claude JSON response");
    }

    res.json({ triage: triageData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/transcribe", async (req, res) => {
  if (!openai) {
    return res.status(500).json({
      error:
        "OpenAI (Whisper) not configured. Please add OPENAI_API_KEY to .env",
    });
  }
  // Logic for Whisper transcription
  res.json({ message: "Whisper transcription endpoint" });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
