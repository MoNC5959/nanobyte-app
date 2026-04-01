const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

let state = {
  nutrients: {
    vitaminD:  { value: 62,  unit: 'ng/mL',  status: 'Absorbed' },
    vitaminA:  { value: 1.2, unit: 'µmol/L', status: 'Requires Attention' },
    iron:      { value: 115, unit: 'ng/mL',  status: 'Absorbed' },
    magnesium: { value: 2.1, unit: 'mg/dL',  status: 'Stable' },
    secondary: [
      { name: 'Zinc',      value: 94  },
      { name: 'Calcium',   value: 9.8 },
      { name: 'B12',       value: 180 },
      { name: 'Potassium', value: 4.2 },
    ],
    accuracy: 98.4,
  },
  biometrics: {
    powerReserve: 15,
    stasisCountdown: 'Automatic stasis in 4 hours',
    cellular: 'Scanning...',
    hydration: 92,
    sleep: 8.4,
    activeEnergy: 1420,
    immuneResponse: 88,
  }
};

function jitter(val, range) {
  return Math.round((val + (Math.random() * range * 2 - range)) * 10) / 10;
}

let tick = 0;
function broadcast() {
  tick++;

  state.nutrients.vitaminD.value  = jitter(62,  1.5);
  state.nutrients.vitaminA.value  = jitter(1.2, 0.05);
  state.nutrients.iron.value      = jitter(115, 3);
  state.nutrients.magnesium.value = jitter(2.1, 0.05);
  state.nutrients.secondary[0].value = jitter(94,  2);
  state.nutrients.secondary[1].value = jitter(9.8, 0.1);
  state.nutrients.secondary[2].value = jitter(180, 5);
  state.nutrients.secondary[3].value = jitter(4.2, 0.05);
  state.nutrients.accuracy        = jitter(98.4, 0.3);

  // Power slowly drains over time
  state.biometrics.powerReserve   = Math.max(1, Math.round((state.biometrics.powerReserve - 0.05 + (Math.random() * 0.1)) * 10) / 10);
  state.biometrics.hydration      = jitter(92, 1);
  state.biometrics.immuneResponse = jitter(88, 1);
  state.biometrics.activeEnergy   = Math.round(jitter(1420, 20));

  // Rotate cellular status
  const cellularStates = ['Scanning...', 'Analyzing...', 'Syncing...', 'Active'];
  state.biometrics.cellular = cellularStates[tick % cellularStates.length];

  const msg = JSON.stringify(state);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg);
  });
}

wss.on('connection', ws => {
  console.log('Client connected');
  ws.send(JSON.stringify(state));
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(broadcast, 2000);
console.log('NanoByte WebSocket server running on ws://localhost:8080');
