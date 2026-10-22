/* Azy Speed Prompt — the small "how fast?" card that pops up when a preset is applied with Shift held.
 *
 *   const speed = await window.azySpeedPrompt.ask(document.body, { name: 'Pop In' });
 *   // → multiplier (1 = 100%) or null when cancelled
 *
 * Same Azy Speed slider as everywhere else (azy-speed.js), same tokens as the wait overlay. It ALWAYS
 * opens at 100% — nothing is remembered between prompts. Enter applies · Esc cancels ·
 * clicking the backdrop cancels.
 */
(function () {
  function describe(p) {
    if (p === 100) return 'As designed';
    if (p > 100) return `${(p / 100).toFixed(p % 100 ? 2 : 0).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')}× faster · ${Math.round(10000 / p)}% of the duration`;
    return `${(100 / p).toFixed(p % 25 ? 2 : 0).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')}× slower · ${Math.round(10000 / p)}% of the duration`;
  }

  function ask(host, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      const el = document.createElement('div');
      el.className = 'azy-wait azy-speed-prompt';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Speed');
      el.innerHTML =
        '<div class="azy-wait-card azy-popup azy-speed-prompt-card">' +
          // The Speed empty/prompt state gets the universe's iconic tool as a quiet
          // corner watermark — behind every control, pointer-events:none.
          (window.azyArt ? window.azyArt.markup('art-dagger', 'speed-art') : '') +
          '<div class="azy-wait-title"></div>' +
          '<div class="azy-speed-prompt-name"></div>' +
          '<div class="speed-big" aria-live="polite"><span class="speed-big-value">100</span><span class="speed-big-unit">%</span></div>' +
          '<div class="azy-speed-prompt-hint"></div>' +
          '<div class="azy-speed-prompt-slot"></div>' +
          '<div class="azy-speed-prompt-scale" aria-hidden="true"><span>50%</span><span>100%</span><span>200%</span></div>' +
          '<div class="azy-speed-prompt-actions">' +
            '<button type="button" class="azy-wait-cancel azy-speed-prompt-cancel">Cancel</button>' +
            '<button type="button" class="azy-speed-prompt-apply"><span>Apply</span></button>' +
          '</div>' +
          '<div class="azy-speed-prompt-foot">Enter applies · Esc cancels</div>' +
        '</div>';
      el.querySelector('.azy-wait-title').textContent = opts.title || 'Speed';
      el.querySelector('.azy-speed-prompt-name').textContent = opts.name || '';
      const big = el.querySelector('.speed-big');
      const bigValue = el.querySelector('.speed-big-value');
      const hint = el.querySelector('.azy-speed-prompt-hint');
      const applyBtn = el.querySelector('.azy-speed-prompt-apply');
      const cancelBtn = el.querySelector('.azy-speed-prompt-cancel');
      const ctl = window.azySpeed.mount(el.querySelector('.azy-speed-prompt-slot'), { key: 'prompt', persist: false });
      ctl.set(100);

      function render() {
        const p = ctl.percent;
        bigValue.textContent = String(p);
        hint.textContent = describe(p);
        el.classList.toggle('is-changed', p !== 100);
        big.classList.remove('bump'); void big.offsetWidth; big.classList.add('bump');
        applyBtn.querySelector('span').textContent = p === 100 ? 'Apply' : `Apply at ${p}%`;
      }
      ctl.onChange(render);
      render();

      let settled = false;
      function finish(v) {
        if (settled) return;
        settled = true;
        document.removeEventListener('keydown', onKey, true);
        el.classList.remove('in');
        el.classList.add('out');
        setTimeout(() => el.remove(), 180);
        resolve(v);
      }
      function onKey(e) {
        if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'text') return; // typing an exact value
        if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); finish(ctl.value); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(null); }
      }
      document.addEventListener('keydown', onKey, true);
      applyBtn.addEventListener('click', () => finish(ctl.value));
      cancelBtn.addEventListener('click', () => finish(null));
      el.addEventListener('mousedown', (e) => { if (e.target === el) finish(null); });

      host.appendChild(el);
      requestAnimationFrame(() => { el.classList.add('in'); const r = el.querySelector('.azy-speed-range'); if (r) r.focus(); });
    });
  }

  window.azySpeedPrompt = { ask, describe };

  /* ---- "Apply with speed" hold modifier (v1.17, Settings › Shortcuts) -------------------------
     Shift (default — unchanged behaviour), Alt, or Off. Read from the click/keydown event's own
     modifier flags at the moment of the gesture — never tracked from keydown/keyup — so a blur,
     Alt-Tab or a key released over Premiere can never leave it "stuck". The exact modifier must be
     the only one held, so Ctrl/Cmd multi-select and other shortcuts never trigger it. */
  const HOLD_MODES = ['shift', 'alt', 'off'];
  let holdMode = 'shift';
  function setHoldMode(v) { holdMode = HOLD_MODES.includes(v) ? v : 'shift'; document.documentElement.setAttribute('data-speed-hold', holdMode); }
  function holdMatches(ev) {
    if (!ev || holdMode === 'off') return false;
    if (ev.ctrlKey || ev.metaKey) return false;
    if (holdMode === 'alt') return !!ev.altKey && !ev.shiftKey;
    return !!ev.shiftKey && !ev.altKey;
  }
  const HOLD_LABEL = { shift: 'Shift', alt: 'Alt', off: '' };
  window.azyHold = { matches: holdMatches, get mode() { return holdMode; }, get label() { return HOLD_LABEL[holdMode]; }, set: setHoldMode, MODES: HOLD_MODES };
  setHoldMode('shift');
  try {
    const A = window.api;
    if (A && A.getSettings) Promise.resolve(A.getSettings()).then((s) => s && setHoldMode(s.uiSpeedHold)).catch(() => {});
    if (A && A.onSettingsChanged) A.onSettingsChanged((s) => s && setHoldMode(s.uiSpeedHold));
  } catch { /* no bridge: Shift */ }
})();
