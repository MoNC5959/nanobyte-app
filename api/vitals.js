/**
 * NanoByte Mock Vitals Service
 *
 * Uses time-seeded sine waves at different frequencies per metric so each
 * reading drifts naturally and independently — no server state needed.
 *
 * Realistic ranges:
 *   Heart rate  60–100 bpm   (base 72)
 *   Glucose     70–140 mg/dL (base 95)
 *   Hydration   80–99 %      (base 92)
 *   pH          7.30–7.50    (base 7.40, very tight regulation)
 */

function wave(base, amplitude, periodMs, phaseShift = 0) {
  const t = Date.now();
  const raw = base + amplitude * Math.sin((2 * Math.PI * t) / periodMs + phaseShift);
  return Math.round(raw * 100) / 100;
}

function jitter(val, noise) {
  return Math.round((val + (Math.random() * noise * 2 - noise)) * 100) / 100;
}

function status(value, low, high, critLow, critHigh) {
  if (value <= critLow || value >= critHigh) return 'critical';
  if (value <= low     || value >= high)     return 'warning';
  return 'normal';
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  // Each metric oscillates on a different wave period for independent drift
  const hrRaw      = wave(72,   6,   14000, 0.0)  + jitter(0, 0.8);  // ~14s cycle
  const glucoseRaw = wave(95,   8,   22000, 1.2)  + jitter(0, 0.5);  // ~22s cycle
  const hydroRaw   = wave(92,   3,   30000, 2.5)  + jitter(0, 0.3);  // ~30s cycle
  const phRaw      = wave(7.40, 0.04, 18000, 0.8) + jitter(0, 0.005); // ~18s cycle

  const hr      = Math.round(Math.max(50, Math.min(120, hrRaw)));
  const glucose = Math.round(Math.max(60, Math.min(160, glucoseRaw)));
  const hydro   = Math.round(Math.max(70, Math.min(100, hydroRaw)));
  const ph      = Math.round(Math.max(7.20, Math.min(7.60, phRaw)) * 100) / 100;

  res.status(200).json({
    timestamp: new Date().toISOString(),
    vitals: {
      heartRate: {
        value:  hr,
        unit:   'bpm',
        label:  'Heart Rate',
        status: status(hr, 60, 100, 50, 110),
        range:  '60–100 bpm',
      },
      glucose: {
        value:  glucose,
        unit:   'mg/dL',
        label:  'Blood Glucose',
        status: status(glucose, 70, 140, 60, 160),
        range:  '70–140 mg/dL',
      },
      hydration: {
        value:  hydro,
        unit:   '%',
        label:  'Hydration',
        status: status(hydro, 85, 99, 75, 100),
        range:  '85–99%',
      },
      ph: {
        value:  ph,
        unit:   '',
        label:  'Blood pH',
        status: status(ph, 7.35, 7.45, 7.30, 7.50),
        range:  '7.35–7.45',
      },
    },
  });
}
