/* Azy Wait — the processing overlay shared by Presets, Flow and the Speed window.
 *
 *   const wait = window.azyWait.show(hostEl, { title: 'Generating Smooth Animation' });
 *   wait.stage('generating');            // preparing → calculating → generating → applying → finalizing
 *   wait.progress(done, total);          // real numbers only; omitted → indeterminate
 *   wait.done('Applied · 1 240 keyframes') / wait.fail('…') → fades out
 *
 * Real stages come from the Premiere runtime's operationProgress events (see azy-status / renderers);
 * nothing here invents a percentage. Presentation: a compact top-right corner toast (azy-activity.css).
 */
(function () {
  const STAGES = {
    preparing: 'Preparing animation…',
    calculating: 'Calculating Flow…',
    generating: 'Generating keyframes…',
    applying: 'Applying animation…',
    finalizing: 'Finalizing…',
  };
  const ORDER = ['preparing', 'calculating', 'generating', 'applying', 'finalizing'];
  const active = new Set(); // operationIds that already have an overlay in this window

  function show(host, opts) {
    opts = opts || {};
    const el = document.createElement('div');
    el.className = 'azy-wait';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<div class="azy-wait-card azy-popup">' +
        '<div class="azy-wait-top">' +
          '<div class="azy-wait-brand">AZY / DAGGER</div>' +
          '<div class="azy-wait-win">' +
            '<button class="azy-wait-min" type="button" title="Minimize to a corner pill" aria-label="Minimize">—</button>' +
            '<button class="azy-wait-close" type="button" title="Hide — Azy keeps working (corner pill)" aria-label="Hide">\u00d7</button>' +
          '</div>' +
        '</div>' +
        '<div class="azy-wait-body">' +
          '<div class="azy-wait-orbit" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>' +
          '<div class="azy-wait-title"></div>' +
          '<div class="azy-wait-name" hidden></div>' +
          '<div class="azy-wait-stage"><span class="azy-wait-stage-text"></span></div>' +
          '<div class="azy-wait-bar" hidden><span class="azy-wait-bar-fill"></span></div>' +
          '<div class="azy-wait-steps" aria-hidden="true">' + ORDER.map((s) => `<i data-stage="${s}"></i>`).join('') + '</div>' +
          '<div class="azy-wait-actions">' +
            (opts.onCancel ? '<button class="azy-wait-cancel" type="button">Cancel</button>' : '') +
            '<button class="azy-wait-min2" type="button"><i aria-hidden="true">—</i>Minimize</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    const title = el.querySelector('.azy-wait-title');
    const nameEl = el.querySelector('.azy-wait-name');
    const stageText = el.querySelector('.azy-wait-stage-text');
    const bar = el.querySelector('.azy-wait-bar');
    const fill = el.querySelector('.azy-wait-bar-fill');
    const steps = Array.from(el.querySelectorAll('.azy-wait-steps i'));
    title.textContent = opts.title || 'Applying preset';
    function setName(text) {
      const v = String(text || '').trim();
      nameEl.hidden = !v;
      nameEl.textContent = v;
    }
    setName(opts.name);
    const cancelBtn = el.querySelector('.azy-wait-cancel');
    const minBtn = el.querySelector('.azy-wait-min');
    // Minimize collapses the overlay into a small corner pill: Premiere keeps working, the
    // veil stops covering the UI, and one click brings the card back. The title-bar dash,
    // the title-bar cross and the gradient Minimize button all collapse the same way.
    function setMini(mini) {
      el.classList.toggle('azy-wait--mini', mini);
      measure();
      minBtn.textContent = mini ? '▢' : '—';
      minBtn.title = mini ? 'Restore the progress card' : 'Minimize to a corner pill';
    }
    // The activity toast sits in the top-right corner (azy-activity.css); short notices
    // (#toastWrap) stack right beneath it, so publish its height to the page.
    function measure() {
      (window.requestAnimationFrame || ((f) => setTimeout(f, 16)))(() => {
        const live = Array.from(document.querySelectorAll('body > .azy-wait:not(.out)'));
        const h = live.reduce((m, w) => Math.max(m, w.offsetHeight || 0), 0);
        document.documentElement.style.setProperty('--azy-wait-h', h ? (h + 8) + 'px' : '0px');
      });
    }
    const toggleMini = () => setMini(!el.classList.contains('azy-wait--mini'));
    minBtn.addEventListener('click', toggleMini);
    el.querySelector('.azy-wait-close').addEventListener('click', () => setMini(true));
    el.querySelector('.azy-wait-min2').addEventListener('click', () => setMini(true));
    if (cancelBtn) {
      cancelBtn.addEventListener('click', async () => {
        cancelBtn.disabled = true;
        cancelBtn.textContent = 'Stopping…';
        // Scheduling stops now; the step Premiere is executing finishes first. The final message
        // (cancelled vs. stopped-with-changes) comes from the operation's real result.
        stage(null, 'Stopping after the current step…');
        try { await opts.onCancel(); } catch (_) { /* reported by the apply itself */ }
      });
    }
    let current = null;
    let closed = false;
    let shownAt = performance.now();

    function stage(name, custom) {
      const key = STAGES[name] ? name : null;
      const text = custom || (key ? STAGES[key] : String(name || ''));
      if (text !== stageText.textContent) {
        stageText.classList.remove('in');
        void stageText.offsetWidth;
        stageText.textContent = text;
        stageText.classList.add('in');
      }
      if (key && key !== current) {
        current = key;
        const idx = ORDER.indexOf(key);
        steps.forEach((s, i) => { s.classList.toggle('done', i < idx); s.classList.toggle('now', i === idx); });
      }
    }
    function progress(done, total) {
      if (!(total > 0) || !(done >= 0)) { bar.hidden = true; return; }
      bar.hidden = false;
      fill.style.width = Math.min(100, Math.round((done / total) * 100)) + '%';
    }
    function close(kind, message) {
      if (closed) return;
      closed = true;
      if (opts.operationId) active.delete(opts.operationId);
      if (cancelBtn) { cancelBtn.disabled = true; cancelBtn.hidden = true; }
      el.classList.add('closing');
      // v1.21: a SUCCESS closes at once — the check state and the 180 ms slide-out run together,
      // and the overlay stops blocking clicks immediately (Premiere is already done).
      if (kind === 'done') {
        el.classList.add('done');
        steps.forEach((s) => { s.classList.remove('now'); s.classList.add('done'); });
        stage(null, message || 'Done');
        bar.hidden = false; fill.style.width = '100%';
        el.style.pointerEvents = 'none';
        el.classList.add('out'); measure();
        setTimeout(() => { el.remove(); measure(); }, 200);
        return;
      }
      // Errors / cancels stay readable: keep it on screen ≥ 420 ms so a fast failure doesn't flash.
      const wait = Math.max(0, 420 - (performance.now() - shownAt));
      setTimeout(() => {
        el.classList.add(kind);
        // DOMTokenList rejects an empty token. The old failed/cancelled path attempted
        // classList.add(''), which threw inside its delayed completion timer and could leave
        // the processing overlay in a half-finished state. Success completes every step;
        // a non-success outcome simply clears the active/completed indicators.
        steps.forEach((s) => {
          s.classList.remove('now');
          if (kind === 'done') s.classList.add('done');
          else s.classList.remove('done');
        });
        stage(null, message || (kind === 'done' ? 'Done' : 'Something went wrong'));
        if (kind === 'done') { bar.hidden = false; fill.style.width = '100%'; }
        setTimeout(() => { el.classList.add('out'); measure(); setTimeout(() => { el.remove(); measure(); }, 260); }, kind === 'done' ? 620 : 1100);
      }, wait);
    }
    if (opts.operationId) { el.dataset.operationId = opts.operationId; active.add(opts.operationId); }
    host.appendChild(el);
    (window.requestAnimationFrame || ((f) => setTimeout(f, 16)))(() => el.classList.add('in'));
    measure();
    stage(opts.stage || 'preparing');
    return {
      el,
      stage,
      progress,
      setName,
      minimize: () => setMini(true),
      restore: () => setMini(false),
      done: (m) => close('done', m),
      fail: (m) => close('failed', m),
      /** Map a runtime operationProgress event → stage/progress. */
      fromEvent(ev) {
        if (!ev) return;
        const step = String(ev.step || '');
        if (STAGES[step]) stage(step);
        else if (step) stage(null, step); // preset executor: "Clip: Effect"
        if (ev.total > 0) progress(ev.done, ev.total);
      },
    };
  }

  // ---- Azy is busy (mirror) -------------------------------------------------------------------
  // The window that started an operation shows its own overlay (above). Every OTHER Azy surface —
  // the main window, the Snap/Speed pop-ups, Azy inside Premiere — mirrors it from operationState
  // events so the user can't click anything anywhere until Premiere is done, and can Cancel from
  // wherever they are looking.
  const mirrors = new Map();
  const TITLES = { flow: 'Applying Flow', speed: 'Adjusting speed', preset: 'Applying preset', effect: 'Applying effect' };
  function onState(ev) {
    if (!ev || !ev.operationId) return;
    const P = window.presets;
    if (ev.state === 'started') {
      if (active.has(ev.operationId) || mirrors.has(ev.operationId)) return;
      const label = TITLES[ev.kind] || 'Azy is working';
      const w = show(document.body, {
        title: label,
        name: ev.name,
        onCancel: P && P.cancelOperation ? () => P.cancelOperation(ev.operationId) : undefined,
      });
      w.stage(null, `${label} in Premiere\u2026`);
      mirrors.set(ev.operationId, w);
      return;
    }
    const w = mirrors.get(ev.operationId);
    if (!w) return;
    mirrors.delete(ev.operationId);
    if (ev.state === 'finished') w.done(`${ev.name} applied`);
    else if (ev.state === 'cancelled') w.fail('Stopped — anything already written stays undoable (Ctrl+Z)');
    else w.fail(`${ev.name} failed`);
  }
  function onProgress(ev) { const w = ev && mirrors.get(ev.operationId); if (w) w.fromEvent(ev); }
  function wire() {
    const P = window.presets;
    if (!P || typeof P.on !== 'function' || wire.done) return;
    wire.done = true;
    P.on('operationState', onState);
    P.on('operationProgress', onProgress);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
  setTimeout(wire, 0);

  window.azyWait = { show, STAGES, ORDER, onState, busy: () => active.size + mirrors.size > 0 };
})();
