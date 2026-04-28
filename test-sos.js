const axios = require("axios");

const BACKEND_URL = "http://localhost:3001/api";

async function testSOS() {
  try {
    console.log("1. Registering test user...");
    const registerRes = await axios
      .post(`${BACKEND_URL}/auth/register`, {
        email: "test@example.com",
        password: "password123",
        name: "Test Responder",
        role: "RESPONDER",
      })
      .catch((e) => {
        if (e.response && e.response.status === 400) {
          console.log("User already exists, logging in...");
          return axios.post(`${BACKEND_URL}/auth/login`, {
            email: "test@example.com",
            password: "password123",
          });
        }
        throw e;
      });

    const token = registerRes.data.token;
    console.log("Token received:", token);

    console.log("2. Triggering SOS Incident...");
    const incidentRes = await axios.post(
      `${BACKEND_URL}/incidents`,
      {
        type: "FIRE",
        location: "Main Kitchen, Floor 1",
        description:
          "Grease fire reported in the main kitchen area. Multiple staff members evacuated.",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log("Incident Created:", incidentRes.data);
    console.log("Wait a few seconds for AI Triage...");

    setTimeout(async () => {
      console.log("3. Checking for AI Triage updates...");
      const allIncidents = await axios.get(`${BACKEND_URL}/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const latest = allIncidents.data.find(
        (inc) => inc.id === incidentRes.data.id,
      );
      console.log("Latest Incident State:", JSON.stringify(latest, null, 2));

      if (latest.metadata) {
        console.log("✅ AI Triage Successful!");
      } else {
        console.log("❌ AI Triage Metadata missing (Check AI Service logs)");
      }
    }, 5000);
  } catch (error) {
    console.error(
      "Test Failed:",
      error.response ? error.response.data : error.message,
    );
  }
}

testSOS();
