/* 26 component families × 4 interaction phases = 104 wired motion presets.
   No idle loops, render observers, per-card listeners, layout reads or click interception.
   Transform/opacity only; native dragging and reduced motion always take priority. */
(function (root) {
  'use strict';
  const families = [
    ['workspace', '.mode-tab', 1.0],
    ['file-row', '#fileGrid .file-card', .45],
    ['preset-tile', '#presetGrid .file-card', .6],
    ['flow-tile', '#flowGrid .file-card', .7],
    ['source', '.pins-strip .chip', .8],
    ['explorer', '.files-sidebar-nav-item', .5],
    ['filter', '.file-filter-btn,.preset-filter-btn', .65],
    ['view', '.file-view-btn', .9],
    ['sort', '.file-sort-control select', 0],
    ['search', '.search-input:not(.flow-name)', 0],
    ['library-action', '.hero-action', .85],
    ['wheel', '.wheel-btn', .95],
    ['scope', '.azy-scope-btn', .55],
    ['curve-value', '.flow-curve-nums input,.flow-name', 0],
    ['curve-action', '.flow-editor button', .75],
    ['settings-category', '.settings-cat', .65],
    ['theme', '#themeSeg .snap-seg-btn', .9],
    ['segment', '.snap-seg-btn', .6],
    ['switch', '.snap-switch', .5],
    ['shortcut', '.snap-keycap', .7],
    ['favorite', '.fav-badge,.flow-edit-badge', .8],
    ['speed', '.azy-speed-step,.azy-speed-value,.azy-speed-reset,.speed-reset,.speed-apply', .55],
    ['player', '.btn,.preview-transport button', .75],
    ['popup', '.gain-row button,.buttons button,#close,.snap-row,.snap-dialog-opt,.snap-dialog-cancel,.welcome-actions button', .45],
    ['quick-action', '.chip,.text-action,.pin-toggle', .6],
    ['utility-icon', '.icon-btn', .85]
  ];
  const phases = ['enter', 'leave', 'press', 'focus'];
  const presets = families.flatMap(([name, selector, strength], i) => phases.map((phase, p) => {
    const lift = +(strength * (1 + i / 80)).toFixed(3);
    const scale = +(1 - strength * (.018 + i / 4000)).toFixed(4);
    const dim = +(1 - (.065 + i / 1400)).toFixed(4);
    let keyframes;
    if (phase === 'enter') keyframes = [{transform:'translateY(0)',opacity:1},{transform:`translateY(-${lift}px)`,opacity:dim},{transform:'translateY(0)',opacity:1}];
    if (phase === 'leave') keyframes = [{opacity:dim},{opacity:1}];
    if (phase === 'press') keyframes = [{transform:'scale(1)',opacity:1},{transform:`scale(${scale})`,opacity:dim},{transform:'scale(1)',opacity:1}];
    if (phase === 'focus') keyframes = [{opacity:dim-.08},{opacity:1}];
    return Object.freeze({name:`azy-${name}-${phase}`,family:name,selector,phase,keyframes,
      options:{duration:120 + i * 2 + [30,0,-20,60][p],easing:'cubic-bezier(.22,.68,.24,1)',fill:'none'}});
  }));
  if (typeof module === 'object' && module.exports) module.exports = {families, phases, presets};
  if (!root || !root.document) return;
  const doc = root.document;
  const reduced = root.matchMedia('(prefers-reduced-motion: reduce)');
  const selector = families.map(f=>f[1]).join(',');
  const active = new Map();
  let dragging = false;
  const cancelAll = () => { for (const a of active.values()) a.cancel(); active.clear(); };
  function find(target) { return target && target.closest ? target.closest(selector) : null; }
  function play(el, phase) {
    const T = root.azyTheme;
    // Hover/focus lifts are decoration: off in reduced motion and Performance. Press stays (instant feedback).
    if (T && (T.reduced() || (!T.decorative() && phase !== 'press'))) return;
    if (!el || (!T && reduced.matches) || doc.hidden || dragging || !el.animate || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    const family = families.find(f=>el.matches(f[1]));
    if (!family) return;
    const spec = presets.find(p=>p.family===family[0] && p.phase===phase);
    const old = active.get(el); if (old) old.cancel();
    // Pointer sweeps cannot leave an unbounded number of compositor layers behind.
    if (active.size >= 6) { const [node, animation] = active.entries().next().value; animation.cancel(); active.delete(node); }
    const animation = el.animate(spec.keyframes, spec.options);
    animation.id = spec.name;
    active.set(el, animation);
    const clear = () => { if (active.get(el) === animation) active.delete(el); };
    animation.onfinish = clear; animation.oncancel = clear;
  }
  doc.addEventListener('pointerover', e => {
    if (!e.buttons) dragging = false;
    const el = find(e.target);
    if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) play(el,'enter');
  }, {passive:true});
  doc.addEventListener('pointerout', e => {
    const el = find(e.target);
    if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) play(el,'leave');
  }, {passive:true});
  doc.addEventListener('pointerdown', e => { if (e.button===0) play(find(e.target),'press'); }, {passive:true});
  doc.addEventListener('focusin', e => play(find(e.target),'focus'));
  doc.addEventListener('keydown', e => { if (!e.repeat && (e.key==='Enter'||e.key===' ') && e.target.matches('button,[role="button"]')) play(find(e.target),'press'); });
  doc.addEventListener('dragstart', () => { dragging=true; cancelAll(); }, true);
  doc.addEventListener('dragend', () => { dragging=false; }, true);
  doc.addEventListener('pointerup', () => { dragging=false; }, true);
  doc.addEventListener('visibilitychange', () => { if(doc.hidden) cancelAll(); });
  root.addEventListener('blur', cancelAll);
  root.addEventListener('focus', () => { dragging=false; });
  reduced.addEventListener('change', () => { if(reduced.matches) cancelAll(); });
})(typeof window === 'undefined' ? null : window);
