function jitter(val, range) {
  return Math.round((val + (Math.random() * range * 2 - range)) * 10) / 10;
}

const cellularStates = ['Scanning...', 'Analyzing...', 'Syncing...', 'Active'];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const tick = Math.floor(Date.now() / 2000);

  res.status(200).json({
    nutrients: {
      vitaminD:  { value: jitter(62,  1.5),  unit: 'ng/mL',  status: 'Absorbed' },
      vitaminA:  { value: jitter(1.2, 0.05), unit: 'µmol/L', status: 'Requires Attention' },
      iron:      { value: jitter(115, 3),    unit: 'ng/mL',  status: 'Absorbed' },
      magnesium: { value: jitter(2.1, 0.05), unit: 'mg/dL',  status: 'Stable' },
      secondary: [
        { name: 'Zinc',      value: jitter(94,  2)   },
        { name: 'Calcium',   value: jitter(9.8, 0.1) },
        { name: 'B12',       value: jitter(180, 5)   },
        { name: 'Potassium', value: jitter(4.2, 0.05)},
      ],
      accuracy: jitter(98.4, 0.3),
    },
    biometrics: {
      powerReserve:     jitter(15, 0.3),
      stasisCountdown:  'Automatic stasis in 4 hours',
      cellular:         cellularStates[tick % cellularStates.length],
      hydration:        jitter(92, 1),
      sleep:            jitter(8.4, 0.1),
      activeEnergy:     Math.round(jitter(1420, 20)),
      immuneResponse:   Math.round(jitter(88, 1)),
    },
  });
}
