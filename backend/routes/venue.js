const express = require("express");
const prisma = require("../utils/db");
const router = express.Router();

// Get full venue structure with sensors
router.get("/structure", async (req, res) => {
  try {
    const venue = await prisma.venue.findFirst({
      include: {
        floors: {
          include: {
            zones: {
              include: {
                sensors: true,
              },
            },
          },
        },
      },
    });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch venue structure" });
  }
});

// Get all zones
router.get("/zones", async (req, res) => {
  try {
    const zones = await prisma.zone.findMany({
      include: {
        floor: true,
      },
    });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch zones" });
  }
});

module.exports = router;
