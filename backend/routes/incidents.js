const express = require("express");
const prisma = require("../utils/db");
const { auth, authorize } = require("../middleware/auth");
const axios = require("axios");
const twilio = require("twilio");
const { generateIncidentReport } = require("../utils/reportGenerator");
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

const twilioClient = process.env.TWILIO_ACCOUNT_SID 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const router = express.Router();

// Create Incident (SOS Trigger)
router.post("/", async (req, res) => {
  const { type, location, description, reporterId } = req.body;

  try {
    const incident = await prisma.incident.create({
      data: {
        type,
        location,
        description,
        reporterId: reporterId || null,
        severity: type === "SOS" ? "CRITICAL" : "MEDIUM",
        status: "OPEN",
      },
    });

    // Emit initial incident
    pusher.trigger("sentinel-channel", "incident-update", incident);

    // Call AI Service for Triage asynchronously
    axios
      .post("http://localhost:5002/triage", {
        description: `Incident Type: ${type}, Location: ${location}, Description: ${description}`,
      })
      .then(async (aiRes) => {
        const triageResult = aiRes.data.triage;

        // Update incident with AI triage metadata
        const updatedIncident = await prisma.incident.update({
          where: { id: incident.id },
          data: {
            metadata: JSON.stringify(triageResult),
          },
        });

        // Emit updated incident with AI metadata
        pusher.trigger("sentinel-channel", "incident-update", updatedIncident);

        // --- REAL-TIME STAFF DISPATCH (TWILIO) ---
        if (twilioClient && process.env.STAFF_PHONE_NUMBER) {
          const message = `🚨 SENTINEL URGENT: [${triageResult.classification}] at ${location}. Severity: ${triageResult.severity}. Protocol: ${triageResult.response_protocol[0]}`;
          
          twilioClient.messages
            .create({
              body: message,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: process.env.STAFF_PHONE_NUMBER,
            })
            .then(msg => console.log(`[Twilio] SMS Sent! SID: ${msg.sid}`))
            .catch(err => console.error(`[Twilio] SMS Failed:`, err.message));
        } else {
          console.log(`\n[Twilio Simulator] 📱 Dispatching SMS to nearest staff...`);
          console.log(`[Twilio Simulator] 📍 Staff found 120ft away from ${location}.`);
          console.log(`[Twilio Simulator] 💬 Message: "URGENT [${triageResult.classification}]: Proceed to ${location}."\n`);
        }

      })
      .catch((err) => console.error("AI Triage failed:", err.message));

    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ error: "Failed to create incident" });
  }
});

// Get all incidents (Public for demo/dashboard)
router.get("/", async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
      include: { reportedBy: { select: { name: true, email: true } } },
    });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

// Update Incident Status/Severity
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, severity, metadata } = req.body;

  try {
    const incident = await prisma.incident.update({
      where: { id },
      data: {
        status,
        severity,
        metadata: typeof metadata === "string" ? metadata : JSON.stringify(metadata),
      },
    });

    // Broadcast update
    pusher.trigger("sentinel-channel", "incident-update", incident);

    res.json(incident);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Failed to update incident" });
  }
});

// Generate PDF Report
router.get("/:id/report", async (req, res) => {
  const { id } = req.params;
  try {
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) return res.status(404).json({ error: "Incident not found" });

    const pdfBuffer = await generateIncidentReport(incident);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sentinel-report-${id}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Report generation failed:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Manual Dispatch SMS
router.post("/:id/dispatch", async (req, res) => {
  const { id } = req.params;
  try {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) return res.status(404).json({ error: "Incident not found" });

    if (twilioClient && process.env.STAFF_PHONE_NUMBER) {
      const message = `🚨 MANUAL DISPATCH: [${incident.type}] at ${incident.location}. Urgent response requested.`;
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.STAFF_PHONE_NUMBER,
      });
      console.log(`[Twilio] Manual SMS Sent for ${id}`);
    }
    res.json({ message: "Dispatch successful" });
  } catch (err) {
    console.error("Manual Dispatch failed:", err.message);
    res.status(500).json({ error: "Failed to dispatch" });
  }
});

module.exports = router;
