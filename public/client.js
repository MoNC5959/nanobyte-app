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
  setText('power-pct',       pwr + '%');
  const bar = document.getElementById('power-bar');
  if (bar) bar.style.width = pwr + '%';
  setText('power-label',     pwr <= 20 ? 'CRITICAL' : pwr <= 50 ? 'WARNING' : 'NORMAL');
  setText('stasis-countdown', b.stasisCountdown);
  setText('cellular-status', b.cellular);
  setText('hydration-value', b.hydration + '%');
  setText('sleep-value',     b.sleep);
  setText('energy-value',    b.activeEnergy.toLocaleString());
  setText('immune-value',    b.immuneResponse);
}

function updateBadge(connected) {
  const badge = document.getElementById('sync-badge');
  if (!badge) return;
  badge.textContent = connected ? 'Live Stream' : 'Reconnecting...';
  badge.style.opacity = connected ? '1' : '0.5';
}

async function poll() {
  try {
    const res = await fetch('/api/readings');
    if (!res.ok) throw new Error('Non-200');
    const data = await res.json();
    applyReading(data);
    updateBadge(true);
  } catch (e) {
    console.warn('[NanoByte] Poll failed:', e);
    updateBadge(false);
  }
}

poll();
setInterval(poll, POLL_INTERVAL);
