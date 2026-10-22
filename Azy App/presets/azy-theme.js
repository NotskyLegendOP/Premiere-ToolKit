/* Azy theme bootstrap for the pop-up windows (Snap Action, Adjust Speed).
 * The main window applies Settings › Colour in renderer.js; these windows share the same
 * settings channel, so they follow it live. presets/themes.css does the rest. */
(function () {
  const THEMES = ['noir', 'crimson', 'dark-red', 'deep-purple', 'indigo', 'dark-blue', 'dark-cyan', 'dark-emerald', 'dark-magenta', 'dark-orange', 'graphite', 'midnight', 'obsidian', 'void', 'panels'];
  const root = document.documentElement;
  function apply(s) {
    if (window.azyTheme) { window.azyTheme.apply(s || {}); return; } // the engine owns every dial
    const MIG = { mono: 'midnight', 'mono-cyan': 'dark-cyan', cyan: 'dark-cyan', violet: 'obsidian', rose: 'dark-magenta', mint: 'dark-emerald', amber: 'dark-orange' };
    const asked = s && (MIG[s.uiTheme] || s.uiTheme);
    const v = asked && THEMES.includes(asked) ? asked : 'noir';
    if (root.dataset.theme !== v) root.dataset.theme = v;
  }
  const A = window.api || window.player;
  if (A && (A.getSettings || A.settings)) {
    Promise.resolve((A.getSettings || A.settings)()).then(apply).catch(() => {});
    if (A.onSettingsChanged) A.onSettingsChanged(apply);
  }
  // Re-entrance choreography: every time a window is shown again it plays a ~2.4 s reveal
  // (see "Reveal" in styles.css). Interaction is never blocked — the input is focused before
  // the first frame; the animation is purely opacity/transform/light.
  window.azyReveal = function (el) {
    if (!el) return;
    el.classList.remove('reveal');
    void el.offsetWidth; // restart when it is already playing
    el.classList.add('reveal');
    clearTimeout(el._revealT);
    el._revealT = setTimeout(() => el.classList.remove('reveal'), 2600);
  };
})();
