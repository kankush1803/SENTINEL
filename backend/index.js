const express = require("express");
const http = require("http");
const Pusher = require("pusher");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

const authRoutes = require("./routes/auth");
const incidentRoutes = require("./routes/incidents");
const venueRoutes = require("./routes/venue");
const prisma = require("./utils/db");
const axios = require("axios");
const twilio = require("twilio");
const twilioClient = process.env.TWILIO_ACCOUNT_SID 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const upload = multer({ dest: "uploads/" });
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5002";

const app = express();
const server = http.createServer(app);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/venue", venueRoutes);

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/venue", venueRoutes);

// Legacy/Simulator Route for Sentinel Integration
app.post("/api/alerts", async (req, res) => {
  const { eventType, severity, zone, floor, source, description } = req.body;

  try {
    const incident = await prisma.incident.create({
      data: {
        type: eventType || "UNKNOWN",
        location: `${zone || "Unknown Zone"}, Floor ${floor || "1"}`,
        description: description || "Sensor Alert",
        severity: severity || "MEDIUM",
        status: "OPEN",
        // For simulator, we might not have a reporterId, so we use a system user or null
        // Let's assume we use the first responder or a system account if exists
        reporterId: (
          await prisma.user.findFirst({ where: { role: "RESPONDER" } })
        )?.id,
      },
    });

    // Broadcast to dashboards
    pusher.trigger("sentinel-channel", "incident-update", incident);

    // AI Triage
    axios
      .post("http://localhost:5002/triage", {
        description: `Alert Type: ${eventType}, Source: ${source}, Description: ${description}`,
      })
        .then(async (aiRes) => {
          const triageResult = aiRes.data.triage;
          const updatedIncident = await prisma.incident.update({
          where: { id: incident.id },
          data: { metadata: JSON.stringify(triageResult) },
        });
        
        pusher.trigger("sentinel-channel", "incident-update", updatedIncident);

        // SMS Dispatch

          // SMS Dispatch
          if (twilioClient && process.env.STAFF_PHONE_NUMBER) {
            const smsContent = `🚨 SENTINEL: [${triageResult.classification}] at ${incident.location}. Source: ${source}. Protocol: ${triageResult.response_protocol[0]}`;
            twilioClient.messages.create({
              body: smsContent,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: process.env.STAFF_PHONE_NUMBER
            }).catch(e => console.error("Simulator SMS failed:", e.message));
          }
        })
      .catch((err) =>
        console.error("AI Triage failed for alert:", err.message),
      );

    res.status(201).json({
      ...incident,
      eventType: incident.type,
      location: {
        zone: zone || "Unknown Zone",
        floor: floor || "1",
      },
    });
  } catch (err) {
    console.error("Failed to process alert:", err);
    res.status(500).json({ error: "Failed to process alert" });
  }
});

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file provided." });
  }

  const filePath = req.file.path;

  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(`${AI_SERVICE_URL}/transcribe`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    // Clean up
    fs.unlinkSync(filePath);

    res.json(response.data);
  } catch (error) {
    console.error("Transcription proxy error:", error.message);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
});
  res.json({
    status: "ok",
    message: "Rapid Crisis Response Backend is running",
  });
});

// Pusher Trigger Helper (Optional but cleaner)
app.post("/api/sos-trigger", async (req, res) => {
  const data = req.body;
  try {
    const incident = await prisma.incident.create({
      data: {
        type: "SOS",
        location: data.location || "Unknown Location",
        description: data.description || "Emergency SOS triggered from mobile app",
        severity: "CRITICAL",
        status: "OPEN",
        reporterId: data.userId || null,
      },
    });

    pusher.trigger("sentinel-channel", "incident-update", incident);

    // AI Triage
    axios
      .post("http://localhost:5002/triage", {
        description: `SOS Triggered at ${data.location || "Unknown Location"}. User ID: ${data.userId || "guest"}`,
      })
      .then(async (aiRes) => {
        const triageResult = aiRes.data.triage;
        const updatedIncident = await prisma.incident.update({
          where: { id: incident.id },
          data: { metadata: JSON.stringify(triageResult) },
        });
        pusher.trigger("sentinel-channel", "incident-update", updatedIncident);
      })
      .catch((err) =>
        console.error("AI Triage failed for SOS:", err.message),
      );

    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ error: "Failed to process SOS trigger" });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
