/* Scope uses Premiere's real targeting semantics. Selected refers ONLY to keyframes
 * highlighted in Premiere's Effect Controls panel — never an Azy picker. Premiere has no
 * scripting API for that highlight, so at apply time Azy detects it natively: it sends
 * Delete (which removes exactly the highlighted keys), diffs the keyframe inventory to
 * identify them to the tick, then Ctrl+Z restores them before easing only those keys.
 * Speed shares it: its card exposes Selected as a button + "Apply to selected only" toggle
 * (the segmented control there stays Clip / Playhead). */
(function () {
  const OPTIONS = [
    { id: 'all', label: 'Clip', title: 'Every keyframe of the selected clip(s)' },
    { id: 'selected', label: 'Selected', title: 'Keys highlighted in Premiere Effect Controls — Azy detects them natively when you apply (it focuses Effect Controls, then a quick Delete + Ctrl+Z)', flowOnly: true },
    { id: 'playhead', label: 'Playhead', title: 'Only the two keyframes around the playhead (per property) — park the playhead between the keyframes you want to ease' },
  ];
  const HINT = {
    all: 'Easing every keyframe of the selected clip(s)',
    selected: 'Easing only the keyframes highlighted in Premiere Effect Controls — highlight them, then apply',
    playhead: 'Easing only the keyframe pair around the playhead',
  };
  function storageKey(key) { return 'azy.scope.' + (key || 'flow'); }
  function load(key, options) {
    try { const v = localStorage.getItem(storageKey(key)); if (v && options.some((o) => o.id === v)) return v; } catch (_) { /* no storage */ }
    return 'all';
  }
  function mount(slot, opts) {
    opts = opts || {};
    const key = opts.key || 'flow';
    // Flow shows all three in its segmented control. Speed drives Selected from its own
    // button + toggle pair, so the option exists (set/load/undo work) but its segment is hidden.
    const options = key === 'flow' ? OPTIONS : OPTIONS.map((o) => (o.flowOnly ? Object.assign({}, o, { uiHidden: true }) : o));
    let value = load(key, options);
    const listeners = [];
    const el = document.createElement('div');
    el.className = 'azy-scope';
    el.setAttribute('role', 'radiogroup');
    el.setAttribute('aria-label', 'Which keyframes');
    const btns = options.map((o) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'azy-scope-btn' + (o.uiHidden ? ' azy-scope-btn--hidden' : '');
      b.dataset.scope = o.id;
      b.textContent = o.label;
      b.title = o.title;
      b.setAttribute('role', 'radio');
      b.addEventListener('click', () => set(o.id, true));
      b.addEventListener('keydown', (event) => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const vis = options.map((opt, idx) => [opt, idx]).filter(([opt]) => !opt.uiHidden);
        const at = vis.findIndex(([opt]) => opt === o);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? vis.length - 1 : (at + (event.key === 'ArrowRight' ? 1 : -1) + vis.length) % vis.length;
        set(vis[next][0].id, true);
        btns[vis[next][1]].focus();
      });
      el.appendChild(b);
      return b;
    });
    function render() {
      for (const b of btns) { const on = b.dataset.scope === value; b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; }
    }
    function set(v, user) {
      if (!options.some((o) => o.id === v) || v === value) return;
      const previous = value;
      value = v;
      try { localStorage.setItem(storageKey(key), v); } catch (_) { /* fine */ }
      render();
      if (user && window.azyUndo) window.azyUndo.record({ label: key === 'speed' ? 'Speed scope' : 'Flow scope', id: 'scope:' + key, undo: () => set(previous, false), redo: () => set(v, false) });
      for (const cb of listeners) { try { cb(value, !!user); } catch (_) { /* listener error */ } }
    }
    render();
    slot.appendChild(el);
    // Keep instances sharing the same scope key in sync. Speed owns a separate key.
    window.addEventListener('storage', (e) => { if (e.key === storageKey(key) && e.newValue && e.newValue !== value) set(e.newValue, false); });
    return {
      get value() { return value; },
      get canApply() { return true; },
      set: (v) => set(v, false),
      onChange: (cb) => { listeners.push(cb); return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); }; },
      hint: () => HINT[value],
      el,
    };
  }
  window.azyScope = { mount, OPTIONS, HINT };
})();
