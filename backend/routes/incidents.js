const express = require("express");
const prisma = require("../utils/db");
const { auth, authorize } = require("../middleware/auth");
const axios = require("axios");

const router = express.Router();

// Create Incident (SOS Trigger)
router.post("/", auth, async (req, res) => {
  const { type, location, description } = req.body;

  try {
    const incident = await prisma.incident.create({
      data: {
        type,
        location,
        description,
        reporterId: req.user.id,
        severity: type === "SOS" ? "CRITICAL" : "MEDIUM",
        status: "OPEN",
      },
    });

    // Emit initial incident
    req.app.get("io").emit("incident-update", incident);

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
        req.app.get("io").emit("incident-update", updatedIncident);
      })
      .catch((err) => console.error("AI Triage failed:", err.message));

    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ error: "Failed to create incident" });
  }
});

// Get all incidents (Public for demo/dashboard)
router.get(
  "/",
  async (req, res) => {
    try {
      const incidents = await prisma.incident.findMany({
        orderBy: { createdAt: "desc" },
        include: { reportedBy: { select: { name: true, email: true } } },
      });
      res.json(incidents);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  },
);

module.exports = router;
