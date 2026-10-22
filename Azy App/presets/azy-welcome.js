// First launch only: a single card that runs the real checks (Azy, Premiere installed,
// Premiere module, connection) and reports plainly. No configuration, nothing technical.
(function () {
  const P = window.presets;
  const back = document.getElementById('welcome');
  // Desktop window only: inside Premiere the panel is already "set up" by definition.
  if (!P || !back || !window.api || !window.api.getSettings || !window.api.setPrefs || document.body.classList.contains('in-premiere')) return;
  if (P.workspace && P.workspace !== 'all') return; // one welcome, in the all-in-one window Azy starts with
  const rows = Object.fromEntries(Array.from(back.querySelectorAll('li[data-k]')).map((li) => [li.dataset.k, li]));
  const result = document.getElementById('welcomeResult');
  const fixBtn = document.getElementById('welcomeFix');
  const doneBtn = document.getElementById('welcomeDone');
  const sub = back.querySelector('.welcome-sub');

  function mark(k, cls, note) {
    const li = rows[k]; if (!li) return;
    li.classList.remove('is-busy', 'is-ok', 'is-warn', 'is-err');
    if (cls) li.classList.add(cls);
    li.querySelector('em').textContent = note || '';
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function run() {
    back.hidden = false;
    sub.hidden = false;
    fixBtn.style.display = 'none';
    for (const k of Object.keys(rows)) mark(k, 'is-busy');
    mark('app', 'is-ok', 'Ready');
    let st = null, conn = null;
    try { await P.boot(); } catch { /* engine problems surface below */ }
    for (let i = 0; i < 20; i++) { // give module detection up to ~6 s, painting as it goes
      st = window.azyStatus ? await window.azyStatus.refresh() : null;
      try { conn = await P.getConnection(); } catch { conn = null; }
      paint(st, conn);
      const m = st && (st.modules || []).find((x) => x.host === 'premiere');
      if (m && !m.busy && (conn && conn.phase === 'connected' || !hostRunning(st))) break;
      await wait(300);
    }
    paint(st, conn, true);
  }
  function hostRunning(st) { const h = st && (st.hosts || []).find((x) => x.id === 'premiere'); return !!(h && h.running); }

  function paint(st, conn, final) {
    const host = st && (st.hosts || []).find((h) => h.id === 'premiere');
    const m = st && (st.modules || []).find((x) => x.host === 'premiere');
    let ok = true;
    if (!host) mark('host', 'is-busy');
    else if (!host.installed) { mark('host', 'is-warn', 'Not detected'); ok = false; }
    else if (host.supported === false) { mark('host', 'is-err', 'Unsupported version'); ok = false; }
    else mark('host', 'is-ok', host.version ? `Detected · ${host.version}` : 'Detected');

    if (!m || m.busy) mark('module', 'is-busy', m ? 'Setting up…' : '');
    else if (m.install === 'installed' || (m.install === 'outdated' && m.connection === 'connected')) mark('module', 'is-ok', 'Installed');
    else if (m.install === 'manual-required') { mark('module', 'is-warn', 'One more step'); ok = false; }
    else { mark('module', 'is-err', m.install === 'outdated' ? 'Update needed' : 'Needs repair'); ok = false; }

    if (conn && conn.phase === 'connected') mark('link', 'is-ok', 'Connected');
    else if (host && !host.installed) mark('link', 'is-warn', 'Needs Premiere');
    else if (!hostRunning(st)) mark('link', final ? 'is-ok' : 'is-busy', final ? 'Links when Premiere opens' : '');
    else mark('link', final ? 'is-warn' : 'is-busy', final ? 'Waiting for Premiere' : 'Connecting…');

    if (!final) return;
    fixBtn.hidden = ok || !m || !['error', 'outdated', 'not-installed'].includes(m.install);
    fixBtn.style.display = fixBtn.hidden ? 'none' : '';
    sub.hidden = true;
    if (ok) { result.textContent = 'Everything is ready.'; }
    else if (host && !host.installed) { result.textContent = 'Premiere Pro was not found. Azy works as a file panel now and links with Premiere as soon as it is installed.'; }
    else { result.textContent = (m && m.next) ? `${m.summary}. ${m.next}` : 'Something needs attention — see the Snap tab.'; }
  }

  fixBtn.addEventListener('click', async () => {
    fixBtn.classList.add('is-loading');
    try { await window.azyStatus.repair(); } finally { fixBtn.classList.remove('is-loading'); }
    run();
  });
  doneBtn.addEventListener('click', () => {
    back.classList.add('out');
    setTimeout(() => { back.hidden = true; back.classList.remove('out'); }, 280);
    window.api.setPrefs({ welcomed: true }).catch(() => {});
  });

  window.api.getSettings().then((s) => { if (!s || s.welcomed !== true) run(); }).catch(() => {});
  window.azyWelcome = { run };
})();
