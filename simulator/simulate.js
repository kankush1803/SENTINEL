#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════
 *  SENTINEL — Emergency Event Simulator
 *  Sends realistic crisis events to the backend at random intervals.
 * ═══════════════════════════════════════════════════════════════════════
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api/alerts';

const SCENARIOS = [
  {
    eventType: 'FIRE',
    severity: 'CRITICAL',
    zone: 'Kitchen',
    floor: 'Ground',
    source: 'IOT_SMOKE_SENSOR_K3',
    description: 'Smoke detected in main kitchen — particulate levels exceeding 800 ppm.',
  },
  {
    eventType: 'FIRE',
    severity: 'HIGH',
    zone: 'Tower A',
    floor: '8',
    source: 'IOT_HEAT_SENSOR_A812',
    description: 'Abnormal heat rise detected in Room 812 — temperature 62°C.',
  },
  {
    eventType: 'MEDICAL',
    severity: 'HIGH',
    zone: 'Pool & Spa',
    floor: 'Ground',
    source: 'WEARABLE_PANIC_BTN',
    description: 'Guest activated panic button near pool area — possible drowning incident.',
  },
  {
    eventType: 'MEDICAL',
    severity: 'CRITICAL',
    zone: 'Ballroom',
    floor: '2',
    source: 'STAFF_APP_REPORT',
    description: 'Unresponsive guest found at banquet event — CPR initiated by staff.',
  },
  {
    eventType: 'ACTIVE_SHOOTER',
    severity: 'CRITICAL',
    zone: 'Main Lobby',
    floor: 'Ground',
    source: 'AI_CCTV_CAM_L04',
    description: 'Weapon detected by AI camera — armed individual near main entrance.',
  },
  {
    eventType: 'GAS_LEAK',
    severity: 'HIGH',
    zone: 'Kitchen',
    floor: 'Ground',
    source: 'IOT_VOC_SENSOR_K1',
    description: 'Natural gas concentration above threshold — 1200 ppm detected.',
  },
  {
    eventType: 'INTRUDER',
    severity: 'MEDIUM',
    zone: 'Parking Garage',
    floor: 'Basement',
    source: 'AI_CCTV_CAM_P02',
    description: 'Unauthorized individual detected in restricted parking zone B.',
  },
  {
    eventType: 'FLOOD',
    severity: 'MEDIUM',
    zone: 'Tower B',
    floor: '3',
    source: 'IOT_WATER_SENSOR_B301',
    description: 'Water leak detected in Room 301 — water level rising.',
  },
  {
    eventType: 'CROWD_CRUSH',
    severity: 'HIGH',
    zone: 'Ballroom',
    floor: '2',
    source: 'AI_CROWD_ANALYSIS',
    description: 'Crowd density exceeding safe threshold — 4.2 persons/m² detected.',
  },
  {
    eventType: 'POWER_OUTAGE',
    severity: 'MEDIUM',
    zone: 'Tower A',
    floor: '1-15',
    source: 'BUILDING_MGMT_SYSTEM',
    description: 'Complete power loss in Tower A — backup generators activating.',
  },
  {
    eventType: 'EARTHQUAKE',
    severity: 'CRITICAL',
    zone: 'Main Lobby',
    floor: 'All',
    source: 'EXTERNAL_USGS_API',
    description: 'Seismic activity detected — magnitude 5.2 — structural check required.',
  },
  {
    eventType: 'MEDICAL',
    severity: 'MEDIUM',
    zone: 'Fitness Center',
    floor: '1',
    source: 'STAFF_APP_REPORT',
    description: 'Guest experiencing chest pain at gym — requesting AED and paramedics.',
  },
  {
    eventType: 'FIRE',
    severity: 'CRITICAL',
    zone: 'Restaurant',
    floor: 'Ground',
    source: 'IOT_SMOKE_SENSOR_R1',
    description: 'Grease fire detected in restaurant kitchen — sprinklers activated.',
  },
];

function getRandomScenario() {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}

function getRandomInterval() {
  // Random interval between 3 and 8 seconds
  return Math.floor(Math.random() * 5000) + 3000;
}

async function sendAlert(scenario) {
  try {
    const res = await axios.post(API_URL, scenario);
    const a = res.data;
    console.log(`🚨 [${a.severity}] ${a.eventType} → ${a.location.zone} (Floor ${a.location.floor})`);
    console.log(`   📝 ${a.description}`);
    console.log(`   🆔 ${a.id}\n`);
  } catch (err) {
    console.error(`❌ Failed to send alert: ${err.message}`);
  }
}

async function runSimulation() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🛡️  SENTINEL — Emergency Event Simulator');
  console.log('  Sending random crisis events every 3-8 seconds...');
  console.log('  Press Ctrl+C to stop.');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Send first alert immediately
  await sendAlert(getRandomScenario());

  // Then send at random intervals
  function scheduleNext() {
    const interval = getRandomInterval();
    setTimeout(async () => {
      await sendAlert(getRandomScenario());
      scheduleNext();
    }, interval);
  }

  scheduleNext();
}

runSimulation();
