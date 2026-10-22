/* Azy link code ("pin") dialog — the connecting system from before.
 *
 * Azy links its Premiere runtime automatically when the Azy panel is open inside Premiere. When that
 * doesn't happen (panel closed, first run, token reset), Azy shows a 6-digit code; type it into the
 * Azy panel in Premiere (Window › Extensions › Azy › "Link with a code") and the two are paired.
 *
 *   window.azyPair.show()   // opens (or refreshes) the dialog; auto-closes when Premiere connects
 */
(function () {
  const P = window.presets;
  let dlg = null, codeEl = null, subEl = null, timer = null, pairing = null;

  function build() {
    dlg = document.createElement('div');
    dlg.className = 'azy-pair';
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-label', 'Link Azy with Premiere Pro');
    dlg.innerHTML =
      '<div class="azy-pair-card">' +
        '<button class="icon-btn azy-pair-close" type="button" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<div class="azy-pair-title">Link with Premiere Pro</div>' +
        '<div class="azy-pair-sub">Azy usually links by itself while the Azy panel is open in Premiere. If it hasn\'t: in Premiere open <b>Window › Extensions › Azy</b> › <b>Link with a code</b> and enter this code</div>' +
        '<div class="azy-pair-code" aria-live="polite"><span>–</span><span>–</span><span>–</span><span>–</span><span>–</span><span>–</span></div>' +
        '<div class="azy-pair-port">Port <b>–</b> <span>· only needed if the panel asks for it</span></div>' +
        '<div class="azy-pair-foot"><span class="azy-pair-dot"></span><span class="azy-pair-status">Waiting for Premiere…</span><span class="azy-pair-spacer"></span><button class="chip chip--ghost azy-pair-new" type="button"><span>New code</span></button></div>' +
      '</div>';
    document.body.appendChild(dlg);
    codeEl = dlg.querySelector('.azy-pair-code');
    subEl = dlg.querySelector('.azy-pair-status');
    dlg.querySelector('.azy-pair-close').addEventListener('click', hide);
    dlg.querySelector('.azy-pair-new').addEventListener('click', () => refresh(true));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) hide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dlg.classList.contains('in')) hide(); });
  }
  function paintCode(code, port) {
    const digits = String(code || '').padEnd(6, '–').slice(0, 6).split('');
    codeEl.querySelectorAll('span').forEach((s, i) => { s.textContent = digits[i]; });
    const pe = dlg.querySelector('.azy-pair-port b');
    if (pe) pe.textContent = port ? String(port) : '–';
  }
  function tick() {
    if (!pairing) return;
    const left = Math.max(0, Math.round((pairing.expiresAt - Date.now()) / 1000));
    subEl.textContent = left > 0 ? `Code valid for ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} · Azy links automatically when the panel is open` : 'Code expired — get a new one';
    if (left <= 0) { clearInterval(timer); timer = null; }
  }
  async function refresh(force) {
    try {
      if (force) { try { await P.forgetTokens(); } catch (_) {} }
      pairing = await P.beginPairing();
      paintCode(pairing.code, pairing.port);
      clearInterval(timer);
      timer = setInterval(tick, 1000);
      tick();
    } catch (err) {
      paintCode('');
      subEl.textContent = String((err && err.message) || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, '');
    }
  }
  function show() {
    if (!dlg) build();
    dlg.classList.add('in');
    refresh(false);
    if (P.azyCommand) P.azyCommand({ capability: 'link', action: 'reconnect', surface: 'pair' }).catch(() => {});
  }
  function hide() {
    if (!dlg) return;
    dlg.classList.remove('in');
    clearInterval(timer); timer = null;
  }
  if (P && P.on) {
    P.on('pairing', (p) => { if (dlg && dlg.classList.contains('in')) { pairing = p; paintCode(p.code, p.port); tick(); } });
    P.on('connection', (c) => {
      if (dlg && dlg.classList.contains('in') && c && c.phase === 'connected') {
        subEl.textContent = `Linked — Azy is running in ${c.label || 'Premiere Pro'}`;
        dlg.classList.add('ok');
        setTimeout(() => { hide(); dlg.classList.remove('ok'); }, 900);
      }
    });
  }
  window.azyPair = { show, hide };
})();
