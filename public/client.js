const POLL_INTERVAL = 2000;

function flash(el) {
  el.style.transition = 'background-color 0.15s ease';
  el.style.backgroundColor = 'rgba(0, 82, 209, 0.12)';
  setTimeout(() => { el.style.backgroundColor = ''; }, 450);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const str = String(value);
  if (el.textContent === str) return;
  el.textContent = str;
  flash(el);
}

// ── Nutrient Analysis + Biometric Overview ──────────────────────────────────

function applyReading(data) {
  const n = data.nutrients;
  const b = data.biometrics;

  // index.html — Nutrient Analysis
  setText('vit-d-value',     n.vitaminD.value  + ' ng/mL');
  setText('vit-a-value',     n.vitaminA.value  + ' µmol/L');
  setText('iron-value',      n.iron.value      + ' ng/mL');
  setText('mag-value',       n.magnesium.value + ' mg/dL');
  setText('zinc-value',      n.secondary[0].value);
  setText('calcium-value',   n.secondary[1].value);
  setText('b12-value',       n.secondary[2].value);
  setText('potassium-value', n.secondary[3].value);
  setText('accuracy-value',  n.accuracy + '% Accuracy');
  setText('last-updated',    'Just now via NanoSync · Live');

  // dashboard.html — Biometric Overview
  const pwr = Math.round(b.powerReserve);
  setText('power-pct',        pwr + '%');
  const bar = document.getElementById('power-bar');
  if (bar) bar.style.width = pwr + '%';
  setText('power-label',      pwr <= 20 ? 'CRITICAL' : pwr <= 50 ? 'WARNING' : 'NORMAL');
  setText('stasis-countdown', b.stasisCountdown);
  setText('cellular-status',  b.cellular);
  setText('hydration-value',  b.hydration + '%');
  setText('sleep-value',      b.sleep);
  setText('energy-value',     b.activeEnergy.toLocaleString());
  setText('immune-value',     b.immuneResponse);
}

function updateBadge(connected) {
  const badge = document.getElementById('sync-badge');
  if (!badge) return;
  badge.textContent  = connected ? 'Live Stream' : 'Reconnecting...';
  badge.style.opacity = connected ? '1' : '0.5';
}

async function pollReadings() {
  try {
    const res  = await fetch('/api/readings');
    if (!res.ok) throw new Error('Non-200');
    applyReading(await res.json());
    updateBadge(true);
  } catch (e) {
    console.warn('[NanoByte] readings poll failed:', e);
    updateBadge(false);
  }
}

// ── Live Vitals ──────────────────────────────────────────────────────────────

const STATUS_CLASSES = {
  normal:   'status-normal',
  warning:  'status-warning',
  critical: 'status-critical',
};

const STATUS_LABELS = {
  normal:   'Normal',
  warning:  'Warning',
  critical: 'Critical',
};

function applyVitalStatus(key, status) {
  const el = document.getElementById('status-' + key);
  if (!el) return;
  el.className = el.className.replace(/status-(normal|warning|critical)/g, '');
  el.classList.add(STATUS_CLASSES[status] || 'status-normal');
  const label = el.querySelector('.status-text');
  if (label) label.textContent = STATUS_LABELS[status] || status;
}

function applyVitals(data) {
  const v = data.vitals;

  // Timestamp
  const ts = document.getElementById('last-ts');
  if (ts) {
    const d = new Date(data.timestamp);
    ts.textContent = d.toLocaleTimeString();
  }

  // Heart rate
  setText('val-heartRate', v.heartRate.value);
  applyVitalStatus('heartRate', v.heartRate.status);

  // Glucose
  setText('val-glucose', v.glucose.value);
  applyVitalStatus('glucose', v.glucose.status);

  // Hydration
  setText('val-hydration', v.hydration.value);
  applyVitalStatus('hydration', v.hydration.status);
  const hBar = document.getElementById('hydration-bar');
  if (hBar) hBar.style.width = Math.min(100, v.hydration.value) + '%';

  // pH
  setText('val-ph', v.ph.value.toFixed(2));
  applyVitalStatus('ph', v.ph.status);
  // Position pH marker: map 7.20–7.60 range → 0–100%
  const phMarker = document.getElementById('ph-marker');
  if (phMarker) {
    const pct = ((v.ph.value - 7.20) / (7.60 - 7.20)) * 100;
    phMarker.style.marginLeft = Math.max(0, Math.min(100, pct)) + '%';
  }
}

async function pollVitals() {
  try {
    const res = await fetch('/api/vitals');
    if (!res.ok) throw new Error('Non-200');
    applyVitals(await res.json());
  } catch (e) {
    console.warn('[NanoByte] vitals poll failed:', e);
  }
}

// ── Start polling ────────────────────────────────────────────────────────────

pollReadings();
pollVitals();
setInterval(pollReadings, POLL_INTERVAL);
setInterval(pollVitals,   POLL_INTERVAL);
