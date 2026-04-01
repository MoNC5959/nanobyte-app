const WS_URL = 'ws://localhost:8080';
let socket;

function connect() {
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('[NanoByte] WebSocket connected');
    updateConnectionBadge(true);
  };

  socket.onclose = () => {
    console.log('[NanoByte] WebSocket disconnected — retrying in 3s');
    updateConnectionBadge(false);
    setTimeout(connect, 3000);
  };

  socket.onerror = (err) => {
    console.warn('[NanoByte] WebSocket error', err);
  };

  socket.onmessage = (event) => {
    try {
      applyReading(JSON.parse(event.data));
    } catch (e) {
      console.error('[NanoByte] Failed to parse message', e);
    }
  };
}

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

  // ── index.html: Nutrient Analysis ──
  setText('vit-d-value',    n.vitaminD.value  + ' ng/mL');
  setText('vit-a-value',    n.vitaminA.value  + ' µmol/L');
  setText('iron-value',     n.iron.value      + ' ng/mL');
  setText('mag-value',      n.magnesium.value + ' mg/dL');
  setText('zinc-value',     n.secondary[0].value);
  setText('calcium-value',  n.secondary[1].value);
  setText('b12-value',      n.secondary[2].value);
  setText('potassium-value',n.secondary[3].value);
  setText('accuracy-value', n.accuracy + '% Accuracy');
  setText('last-updated',   'Just now via NanoSync · Live');

  // ── dashboard.html: Biometric Overview ──
  const pwr = Math.round(b.powerReserve);
  setText('power-pct', pwr + '%');
  const bar = document.getElementById('power-bar');
  if (bar) bar.style.width = pwr + '%';
  setText('power-label', pwr <= 20 ? 'CRITICAL' : pwr <= 50 ? 'WARNING' : 'NORMAL');
  setText('stasis-countdown', b.stasisCountdown);
  setText('cellular-status',  b.cellular);
  setText('hydration-value',  b.hydration + '%');
  setText('sleep-value',      b.sleep);
  setText('energy-value',     b.activeEnergy.toLocaleString());
  setText('immune-value',     Math.round(b.immuneResponse));
}

function updateConnectionBadge(connected) {
  const badge = document.getElementById('sync-badge');
  if (!badge) return;
  badge.textContent = connected ? 'Live Stream' : 'Reconnecting...';
  badge.style.opacity = connected ? '1' : '0.5';
}

connect();
