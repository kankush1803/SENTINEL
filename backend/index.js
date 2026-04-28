require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const incidentRoutes = require("./routes/incidents");
const venueRoutes = require("./routes/venue");
const prisma = require("./utils/db");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
});

// Pass io instance to express app to be used in routes
app.set("io", io);

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
    io.emit("incident-update", incident);
    io.emit("new-alert", incident); // Support legacy event name

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
        io.emit("incident-update", updatedIncident);
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

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Rapid Crisis Response Backend is running",
  });
});

// Real-time communication logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("sos-trigger", async (data) => {
    console.log("SOS Triggered via Socket:", data);
    try {
      const incident = await prisma.incident.create({
        data: {
          type: "SOS",
          location: data.location || "Unknown Location",
          description: "Emergency SOS triggered from mobile app",
          severity: "CRITICAL",
          status: "OPEN",
          reporterId: data.userId || null,
        },
      });

      io.emit("incident-update", incident);
      io.emit("new-alert", incident);

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
          io.emit("incident-update", updatedIncident);
        })
        .catch((err) =>
          console.error("AI Triage failed for SOS:", err.message),
        );
    } catch (err) {
      console.error("Failed to process SOS trigger:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
