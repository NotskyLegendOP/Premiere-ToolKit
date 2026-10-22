/* AZY Theme Engine — the ONE place the global look is decided (v1.12 spider foundation).
 *
 * Every window (desktop shell, hosted Premiere panel, Snap, Speed, player, Dagger) loads this
 * tiny file in <head>, before first paint. It owns five dials and writes them as attributes on
 * <html>; design-tokens.css + presets/azy-foundation.css turn those attributes into tokens, so
 * no feature ever needs its own theme code:
 *
 *   data-theme       accent palette            crimson (default) · dark-red · deep-purple · indigo ·
 *                                              dark-blue · dark-cyan · dark-emerald · dark-magenta ·
 *                                              dark-orange · graphite · (legacy) midnight · obsidian ·
 *                                              void · panels
 *   data-perf        visual quality            full · balanced · performance
 *   data-motion      resolved motion           full · reduced   (from uiMotion + prefers-reduced-motion)
 *   data-webs        decorative web layer      on · off
 *   data-characters  spider-character layer    on · off (always off in performance / reduced motion)
 *   data-skin        visual style              glow (the Spider design — the only style)
 *
 * Persistence: main-process settings (uiTheme, uiPerf, uiMotion, uiWebs, uiCharacters) are the
 * source of truth and are broadcast to every window. A localStorage mirror lets the very first
 * frame paint the right theme before IPC answers — startup never flashes or waits.
 *
 * Nothing here animates, polls or measures layout. Cost: a handful of attribute writes on change.
 */
(function (root) {
  'use strict';

  // v1.17: Dark red (id 'crimson') is the only built-in theme offered. The legacy ids stay valid so
  // old settings files and older windows still load; main.js migrates them to custom themes once.
  var ACCENTS = [
    { id: 'noir', label: 'Dark' },          // v1.20 default: black + white
    { id: 'crimson', label: 'Dark red' },
    { id: 'dark-red', label: 'Deep red', legacy: true },
    { id: 'deep-purple', label: 'Purple', legacy: true },
    { id: 'indigo', label: 'Indigo', legacy: true },
    { id: 'dark-blue', label: 'Blue', legacy: true },
    { id: 'dark-cyan', label: 'Cyan', legacy: true },
    { id: 'dark-emerald', label: 'Emerald', legacy: true },
    { id: 'dark-magenta', label: 'Magenta', legacy: true },
    { id: 'dark-orange', label: 'Orange', legacy: true },
    { id: 'graphite', label: 'Graphite', legacy: true },
    { id: 'midnight', label: 'Midnight', legacy: true },
    { id: 'obsidian', label: 'Obsidian', legacy: true },
    { id: 'void', label: 'Void', legacy: true },
    { id: 'panels', label: 'Per panel', legacy: true }
  ];
  var IDS = ACCENTS.map(function (a) { return a.id; });
  var DEFAULT_ACCENT = 'noir';
  var LEGACY = { mono: 'midnight', 'mono-cyan': 'dark-cyan', cyan: 'dark-cyan', violet: 'obsidian', rose: 'dark-magenta', mint: 'dark-emerald', amber: 'dark-orange' };
  var PERF = ['full', 'balanced', 'performance'];
  var MOTION = ['system', 'reduced', 'full'];
  var CACHE_KEY = 'azy.theme.v1';

  var CUSTOM_RE = /^custom:[a-z0-9-]{1,40}$/;
  function normAccent(v) { if (typeof v === 'string' && CUSTOM_RE.test(v)) return v; var a = LEGACY[v] || v; return IDS.indexOf(a) >= 0 ? a : DEFAULT_ACCENT; }

  /* ---- Custom colour themes (v1.17) -------------------------------------------------------
     A theme is { id, name, colors: { bg, panel, text, border, accent, selection, glow } } with
     #rrggbb colours. Everything that reads a theme goes through normTheme(), so a corrupted or
     hand-edited settings file can never paint an unreadable UI: bad entries are dropped one by
     one, missing colours fall back to the built-in dark red, and surfaces are clamped dark (all
     themes stay dark; text stays readable). main.js uses these same functions. */
  var THEME_KEYS = ['bg', 'panel', 'text', 'border', 'accent', 'selection', 'glow'];
  var BUILTIN_COLORS = { bg: '#050506', panel: '#0f0f12', text: '#ececef', border: '#2c2c33', accent: '#d6283f', selection: '#d6283f', glow: '#d6283f' };
  // Colours of each built-in, so "New / Duplicate" starts from the theme that's actually on screen.
  var BUILTIN_THEMES = { noir: { bg: '#050506', panel: '#0f0f12', text: '#ececef', border: '#2c2c33', accent: '#ececf0', selection: '#ececf0', glow: '#ececf0' }, crimson: BUILTIN_COLORS };
  var MAX_THEMES = 24;
  // Palettes that were built-in accents before v1.17: an install that had one selected gets it
  // back once as its own custom theme (nothing is silently recoloured on update).
  var LEGACY_HUES = { 'dark-red': ['Deep red', '#ff5c62'], 'deep-purple': ['Purple', '#7c5cff'], indigo: ['Indigo', '#6b6ef5'], 'dark-blue': ['Blue', '#5aa2ff'],
    'dark-cyan': ['Cyan', '#4be3ff'], 'dark-emerald': ['Emerald', '#34d399'], 'dark-magenta': ['Magenta', '#ff4fd8'], 'dark-orange': ['Orange', '#ffa94d'],
    graphite: ['Graphite', '#a4acba'], midnight: ['Midnight', '#4f8cff'], obsidian: ['Obsidian', '#8b5cf6'], void: ['Void', '#9d7bff'] };
  function hexRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rgbHex(c) { return '#' + c.map(function (x) { var v = Math.max(0, Math.min(255, Math.round(x))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function lum(c) { var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function darkAtMost(hex, maxL) { var c = hexRgb(hex), i = 0; while (lum(c) > maxL && i++ < 40) c = c.map(function (v) { return v * 0.9; }); return rgbHex(c); }
  function lightAtLeast(hex, minL) { var c = hexRgb(hex), i = 0; while (lum(c) < minL && i++ < 40) c = mix(c, [255, 255, 255], 0.12); return rgbHex(c); }
  function normColor(v, d) {
    v = String(v == null ? '' : v).trim().toLowerCase();
    if (/^#[0-9a-f]{3}$/.test(v)) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    return /^#[0-9a-f]{6}$/.test(v) ? v : d;
  }
  function normTheme(t) {
    if (!t || typeof t !== 'object') return null;
    var id = String(t.id == null ? '' : t.id).toLowerCase();
    if (!/^[a-z0-9-]{1,40}$/.test(id)) return null;
    var name = String(t.name == null ? '' : t.name).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 40) || 'Untitled theme';
    var src = t.colors && typeof t.colors === 'object' ? t.colors : {};
    var c = {};
    for (var i = 0; i < THEME_KEYS.length; i++) c[THEME_KEYS[i]] = normColor(src[THEME_KEYS[i]], BUILTIN_COLORS[THEME_KEYS[i]]);
    c.bg = darkAtMost(c.bg, 0.018);        // every theme stays dark
    c.panel = darkAtMost(c.panel, 0.045);
    c.border = darkAtMost(c.border, 0.16);
    c.text = lightAtLeast(c.text, 0.5);    // and readable
    return { id: id, name: name, colors: c };
  }
  /* ---- Theme from ONE colour (v1.19) ------------------------------------------------------
     Pick any colour on the wheel → a complete, harmonious dark theme: the hue drives everything,
     surfaces stay near-black (faintly tinted), the accent is vivid AND readable (≥ 4.5:1 against
     the background), selection/glow are derived from it. Greys give a neutral Graphite theme. */
  function rgbHsl(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) { var d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s, l];
  }
  function hslHex(h, s, l) {
    h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function f(t) { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
    return rgbHex([f(h / 360 + 1 / 3) * 255, f(h / 360) * 255, f(h / 360 - 1 / 3) * 255]);
  }
  function contrast(a, b) { var x = lum(hexRgb(a)), y = lum(hexRgb(b)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  var HUE_NAMES = [[10, 'Crimson'], [20, 'Scarlet'], [38, 'Orange'], [50, 'Amber'], [64, 'Gold'], [80, 'Lime'], [155, 'Emerald'], [175, 'Jade'], [190, 'Teal'], [205, 'Cyan'], [222, 'Azure'], [245, 'Cobalt'], [265, 'Indigo'], [285, 'Violet'], [310, 'Orchid'], [335, 'Magenta'], [350, 'Rose'], [361, 'Crimson']];
  function hueName(h) { for (var i = 0; i < HUE_NAMES.length; i++) if (h < HUE_NAMES[i][0]) return HUE_NAMES[i][1]; return 'Crimson'; }
  function themeFromColor(seed) {
    var hex = normColor(seed, null);
    if (!hex) return null;
    var hsl = rgbHsl(hexRgb(hex)), h = hsl[0], grey = hsl[1] < 0.1;
    var s = grey ? 0 : Math.max(0.5, Math.min(0.9, hsl[1]));
    var tint = function (k, cap) { return grey ? 0 : Math.min(cap, s * k); };
    var bg = hslHex(h, tint(0.4, 0.32), 0.028);
    var c = {
      bg: bg,
      panel: hslHex(h, tint(0.26, 0.2), 0.068),
      text: hslHex(h, grey ? 0 : 0.08, 0.93),
      border: hslHex(h, tint(0.2, 0.16), 0.19)
    };
    var l = grey ? Math.max(0.62, Math.min(0.86, hsl[2])) : Math.max(0.46, Math.min(0.62, hsl[2]));
    var acc = hslHex(h, s, l), guard = 0;
    while (contrast(acc, bg) < 4.5 && guard++ < 30) { l += 0.015; acc = hslHex(h, s, l); }
    c.accent = acc;
    c.selection = hslHex(h, s, Math.max(0.34, l - 0.1));
    c.glow = hslHex(h, grey ? 0 : Math.min(1, s + 0.05), Math.min(0.72, l + 0.04));
    return { name: grey ? 'Graphite' : hueName(h), colors: c, seed: hex };
  }
  function normThemes(list) {
    if (!Array.isArray(list)) return [];
    var out = [], seen = {};
    for (var i = 0; i < list.length && out.length < MAX_THEMES; i++) { var t = normTheme(list[i]); if (t && !seen[t.id]) { seen[t.id] = 1; out.push(t); } }
    return out;
  }
  // v1.23: the Premiere Toolkit palette (navy glass, blue accent) — offered once as a custom theme.
  function toolkitTheme() {
    return normTheme({ id: 'toolkit', name: 'Toolkit', colors: { bg: '#070b16', panel: '#131a2b', text: '#eceaf0', border: '#232c44', accent: '#3d7bff', selection: '#3d7bff', glow: '#3d7bff' } });
  }
  // v1.24: Iron Man — armour red + arc-reactor gold. Red is the accent, gold is the selection and the glow;
  // the extra gold edges / HUD details live in azy-custom.css and dagger-toolkit.css under data-theme-id="ironman".
  function ironManTheme() {
    return normTheme({ id: 'ironman', name: 'Iron Man', colors: { bg: '#0a0506', panel: '#1a0b0d', text: '#f6ede2', border: '#6b2a22', accent: '#d42a2a', selection: '#f2b01e', glow: '#f2b01e' } });
  }
  function themeFromLegacy(accentId) {
    var L = LEGACY_HUES[accentId];
    if (!L) return null;
    return normTheme({ id: 'was-' + accentId, name: L[0], colors: { accent: L[1], selection: L[1], glow: L[1] } });
  }
  /** The CSS a custom theme paints: tokens only (structure never changes), at a specificity that
      beats the skin / minimal / palette layers in every window. */
  function themeCss(c) {
    var A = hexRgb(c.accent), B = hexRgb(c.bg), P = hexRgb(c.panel), T = hexRgb(c.text), Bd = hexRgb(c.border), S = hexRgb(c.selection), G = hexRgb(c.glow), W = [255, 255, 255];
    var rgb = function (x) { return Math.round(x[0]) + ', ' + Math.round(x[1]) + ', ' + Math.round(x[2]); };
    var t2 = rgbHex(mix(T, B, 0.26)), t3 = rgbHex(mix(T, B, 0.45)), t4 = rgbHex(mix(T, B, 0.6));
    var root = 'html[data-theme="custom"][data-skin]';
    var vars = [
      '--hue-rgb: ' + rgb(A), '--hue: ' + c.accent, '--hue-deep: ' + rgbHex(mix(A, [0, 0, 0], 0.25)), '--hue-soft: ' + rgbHex(mix(A, W, 0.45)),
      '--accent: ' + c.accent, '--azy-accent: ' + c.accent,
      '--azy-glow-rgb-user: ' + rgb(G),
      '--azy-depth-0: ' + c.bg, '--azy-depth-1: ' + rgbHex(mix(B, P, 0.5)), '--azy-depth-2: ' + c.panel, '--azy-depth-3: ' + rgbHex(mix(P, W, 0.03)), '--azy-depth-4: ' + rgbHex(mix(P, W, 0.06)),
      '--azy-text-1: ' + c.text, '--azy-text-2: ' + t2, '--azy-text-3: ' + t3, '--azy-text-4: ' + t4,
      '--text: ' + c.text, '--dim: ' + t2, '--faint: ' + t3,
      '--azy-border-hair: rgba(' + rgb(Bd) + ', 0.5)', '--azy-border: rgba(' + rgb(Bd) + ', 0.75)', '--azy-border-strong: ' + rgbHex(mix(Bd, W, 0.12)),
      '--line: rgba(' + rgb(Bd) + ', 0.6)',
      '--sk-edge-faint: rgba(' + rgb(Bd) + ', 0.5)', '--sk-edge-soft: rgba(' + rgb(Bd) + ', 0.8)', '--sk-edge: ' + rgbHex(mix(Bd, W, 0.12)),
      '--sk-ink: ' + t2,
      '--azy-selected-bg: color-mix(in srgb, ' + c.selection + ' 16%, ' + c.panel + ')', '--azy-selected-edge: rgba(' + rgb(S) + ', 0.6)'
    ].join('; ');
    return root + ', ' + root + ' body, ' + root + ' body.minimal-ui, ' + root + ' body.minimal-ui #app { ' + vars + '; }\n' +
      root + ' body { background-color: ' + c.bg + '; color: ' + c.text + '; }\n' +
      root + ' ::selection { background: rgba(' + rgb(S) + ', 0.38); }\n' +
      root + ' :is(.selected, .is-selected, [aria-selected="true"]):not(.mode-tab):not(.settings-cat) { --hue-rgb: ' + rgb(S) + '; }\n';
  }
  function normPerf(v) { return PERF.indexOf(v) >= 0 ? v : 'full'; }
  function normMotion(v) { return MOTION.indexOf(v) >= 0 ? v : 'system'; }

  // One design: the Spider look (the "Clean" style was removed in v1.16).
  var SKINS = ['glow'];
  function normSkin() { return 'glow'; }
  /* Settings → Customise (v1.16). Every dial is a multiplier on the stock Spider look, painted as a
     CSS custom property on <html> (read by design-tokens.css / azy-custom.css / azy-web.js).
     Ranges mirror main.js normalizeCustomise(). */
  var CUSTOM = {
    // Glow On/Off (v1.19): 1 = the tuned glow, 0 = none. Legacy strengths migrate (0 → off, else on).
    glow: { key: 'uiGlow', lo: 0, hi: 1, dflt: 1, css: '--azy-glow-user', norm: function (v) { if (v === false || v === 'off') return 0; if (v === true || v === 'on') return 1; var n = Number(v); return isFinite(n) && String(v).trim() !== '' ? (n > 0 ? 1 : 0) : 1; } },
    webOpacity: { key: 'uiWebOpacity', lo: 0, hi: 2, dflt: 1, css: '--azy-web-user' },
    radius: { key: 'uiRadius', lo: 0, hi: 2, dflt: 1, css: '--azy-round' },
    glass: { key: 'uiGlass', lo: 0, hi: 100, dflt: 30, css: '--azy-glass-k', map: function (v) { return v / 30; } },
    animSpeed: { key: 'uiAnimSpeed', lo: 0.5, hi: 2, dflt: 1, css: '--azy-speed-k', map: function (v) { return 1 / v; } },
    scale: { key: 'uiScale', lo: 0.85, hi: 1.3, dflt: 1 } // applied by main.js as the window zoom
  };
  var DENSITY = ['light', 'normal', 'dense'];
  function normNum(v, d) { var n = Number(v); return isFinite(n) && String(v).trim() !== '' ? Math.min(d.hi, Math.max(d.lo, Math.round(n * 100) / 100)) : d.dflt; }
  function normDensity(v) { return DENSITY.indexOf(v) >= 0 ? v : 'normal'; }
  var state = { themes: [], accent: DEFAULT_ACCENT, perf: 'full', motion: 'system', webs: true, characters: true, skin: 'glow', glow: 1, webOpacity: 1, webDensity: 'normal', radius: 1, glass: 30, animSpeed: 1, scale: 1 };
  var listeners = [];
  if (typeof module === 'object' && module.exports) {
    module.exports = { THEME_KEYS: THEME_KEYS, BUILTIN_COLORS: BUILTIN_COLORS, MAX_THEMES: MAX_THEMES, normTheme: normTheme, normThemes: normThemes, themeFromLegacy: themeFromLegacy, toolkitTheme: toolkitTheme, ironManTheme: ironManTheme, themeCss: themeCss, LEGACY_HUES: LEGACY_HUES, ACCENTS: ACCENTS, DEFAULT_ACCENT: DEFAULT_ACCENT, PERF: PERF, MOTION: MOTION, normAccent: normAccent, normPerf: normPerf, normMotion: normMotion, SKINS: SKINS, CUSTOM: CUSTOM, DENSITY: DENSITY, normNum: normNum, BUILTIN_THEMES: BUILTIN_THEMES, themeFromColor: themeFromColor, contrast: contrast };
  }
  if (!root || !root.document) return;
  var doc = root.document;
  var html = doc.documentElement;

  var mq = null;
  try { mq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null; } catch (e) { mq = null; }
  function systemReduced() { return !!(mq && mq.matches); }

  function resolvedMotion() {
    if (state.motion === 'reduced') return 'reduced';
    if (state.motion === 'full') return 'full';
    return systemReduced() ? 'reduced' : 'full';
  }

  function setAttr(name, value) { if (html.getAttribute(name) !== value) html.setAttribute(name, value); }

  var previewColors = null;   // live editor preview (this window only; never cached or saved)
  var lastCss = null;
  var adopted = null;
  function findTheme(id) { for (var i = 0; i < state.themes.length; i++) if (state.themes[i].id === id) return state.themes[i]; return null; }
  function activeCustom() { return /^custom:/.test(state.accent) ? findTheme(state.accent.slice(7)) : null; }
  function paintCustomCss(colors) {
    var css = colors ? themeCss(colors) : '';
    if (css === lastCss) return;
    lastCss = css;
    // Constructable sheet first: allowed under strict CSPs (style-src 'self' blocks <style>) and
    // always ordered after the document's own sheets, so it wins without !important.
    try {
      if (root.CSSStyleSheet && 'adoptedStyleSheets' in doc) {
        if (!adopted) { adopted = new root.CSSStyleSheet(); doc.adoptedStyleSheets = doc.adoptedStyleSheets.concat([adopted]); }
        adopted.replaceSync(css);
        return;
      }
    } catch (e) { adopted = null; /* fall back to a <style> element */ }
    var el = doc.getElementById('azy-custom-theme');
    if (!css) { if (el) el.textContent = ''; return; }
    if (!el) { el = doc.createElement('style'); el.id = 'azy-custom-theme'; }
    el.textContent = css;
    // Always the last sheet in <head>, even if a window added stylesheets after first paint.
    var head = doc.head || html;
    if (el.parentNode !== head || el !== head.lastElementChild) head.appendChild(el);
  }
  function paint() {
    var prevTheme = html.getAttribute('data-theme');
    var ct = activeCustom();
    var colors = previewColors || (ct && ct.colors);
    // A selected custom theme that no longer exists (deleted elsewhere / corrupted) falls back to the built-in.
    setAttr('data-theme', colors ? 'custom' : (/^custom:/.test(state.accent) ? DEFAULT_ACCENT : state.accent));
    if (colors && ct && !previewColors) setAttr('data-theme-id', ct.id); else if (html.hasAttribute('data-theme-id')) html.removeAttribute('data-theme-id');
    paintCustomCss(colors);
    setAttr('data-perf', state.perf);
    var motion = resolvedMotion();
    setAttr('data-motion', motion);
    setAttr('data-webs', state.webs && state.perf !== 'performance' ? 'on' : 'off');
    setAttr('data-characters', state.characters && state.perf === 'full' && motion === 'full' ? 'on' : 'off');
    setAttr('data-skin', state.skin);
    setAttr('data-web-density', state.webDensity);
    setAttr('data-glow', state.glow > 0 ? 'on' : 'off');
    for (var k in CUSTOM) {
      var d = CUSTOM[k];
      if (!d.css) continue;
      var v = String(Math.round((d.map ? d.map(state[k]) : state[k]) * 1000) / 1000);
      if (html.style.getPropertyValue(d.css) !== v) html.style.setProperty(d.css, v);
    }
    if (!html.getAttribute('data-section')) html.setAttribute('data-section', 'files');
    return prevTheme !== html.getAttribute('data-theme') || !!colors;
  }

  function snapshot() {
    return { accent: state.accent, themes: state.themes, customTheme: activeCustom(), perf: state.perf, motion: state.motion, resolvedMotion: resolvedMotion(), webs: state.webs, characters: state.characters, skin: state.skin,
      glow: state.glow, webOpacity: state.webOpacity, webDensity: state.webDensity, radius: state.radius, glass: state.glass, animSpeed: state.animSpeed, scale: state.scale };
  }

  function emit(accentChanged) {
    var snap = snapshot();
    for (var i = 0; i < listeners.length; i++) { try { listeners[i](snap, accentChanged); } catch (e) { /* a listener must never break theming */ } }
    try { doc.dispatchEvent(new root.CustomEvent('azy:themechange', { detail: snap })); } catch (e) { /* old engines */ }
  }

  function cache() { try { root.localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ } }

  /** Apply a partial state. Accepts engine names or main-process settings names. */
  function apply(patch, opts) {
    patch = patch || {};
    var before = JSON.stringify(state);
    if (patch.themes !== undefined) state.themes = normThemes(patch.themes); else if (patch.uiCustomThemes !== undefined) state.themes = normThemes(patch.uiCustomThemes);
    if (patch.accent !== undefined || patch.uiTheme !== undefined) state.accent = normAccent(patch.accent !== undefined ? patch.accent : patch.uiTheme);
    if (patch.perf !== undefined || patch.uiPerf !== undefined) state.perf = normPerf(patch.perf !== undefined ? patch.perf : patch.uiPerf);
    if (patch.motion !== undefined || patch.uiMotion !== undefined) state.motion = normMotion(patch.motion !== undefined ? patch.motion : patch.uiMotion);
    if (typeof patch.webs === 'boolean') state.webs = patch.webs; else if (typeof patch.uiWebs === 'boolean') state.webs = patch.uiWebs;
    if (typeof patch.characters === 'boolean') state.characters = patch.characters; else if (typeof patch.uiCharacters === 'boolean') state.characters = patch.uiCharacters;
    if (patch.skin !== undefined || patch.uiSkin !== undefined) state.skin = normSkin(patch.skin !== undefined ? patch.skin : patch.uiSkin);
    for (var ck in CUSTOM) {
      var cd = CUSTOM[ck];
      var cn = cd.norm || function (x) { return normNum(x, cd); };
      if (patch[ck] !== undefined) state[ck] = cn(patch[ck]); else if (patch[cd.key] !== undefined) state[ck] = cn(patch[cd.key]);
    }
    if (patch.webDensity !== undefined) state.webDensity = normDensity(patch.webDensity); else if (patch.uiWebDensity !== undefined) state.webDensity = normDensity(patch.uiWebDensity);
    var accentChanged = paint();
    if (JSON.stringify(state) !== before) { cache(); if (!(opts && opts.silent)) emit(accentChanged); }
    return snapshot();
  }

  /** Change + persist (every window follows through the settings broadcast). */
  function set(patch) {
    var snap = apply(patch);
    var api = root.api || root.player;
    if (api && api.setPrefs) {
      try {
        var p = api.setPrefs({ uiCustomThemes: state.themes, uiTheme: state.accent, uiPerf: state.perf, uiMotion: state.motion, uiWebs: state.webs, uiCharacters: state.characters, uiSkin: state.skin,
          uiGlow: state.glow, uiWebOpacity: state.webOpacity, uiWebDensity: state.webDensity, uiRadius: state.radius, uiGlass: state.glass, uiAnimSpeed: state.animSpeed, uiScale: state.scale });
        if (p && p.catch) p.catch(function () {});
      } catch (e) { /* offline surface */ }
    }
    return snap;
  }

  // 1. First frame: the cached state (no IPC round-trip before paint).
  try { var c = JSON.parse(root.localStorage.getItem(CACHE_KEY) || 'null'); if (c) apply(c, { silent: true }); else paint(); } catch (e) { paint(); }

  // 2. Source of truth: main-process settings, live.
  function fromSettings(s) { if (s) apply(s); }
  var hooked = false;
  function hook() {
    var A = root.api || root.player;
    if (hooked || !A || !(A.getSettings || A.settings)) return;
    hooked = true;
    try { Promise.resolve((A.getSettings || A.settings)()).then(fromSettings).catch(function () {}); } catch (e) { /* no bridge */ }
    if (A.onSettingsChanged) { try { A.onSettingsChanged(fromSettings); } catch (e) { /* no bridge */ } }
  }
  hook();
  // Surfaces whose bridge is installed later in the page (the hosted Premiere panel shim).
  if (!hooked) doc.addEventListener('DOMContentLoaded', hook, { once: true });

  // Windows without a settings bridge (Dagger overlays) follow the mirror written by the others.
  root.addEventListener('storage', function (e) {
    if (e.key !== CACHE_KEY || !e.newValue) return;
    try { apply(JSON.parse(e.newValue)); } catch (err) { /* ignore a torn write */ }
  });

  // 3. OS reduced-motion changes apply live when motion = system.
  if (mq) {
    var onMq = function () { if (state.motion === 'system') { paint(); emit(false); } };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  root.azyTheme = {
    ACCENTS: ACCENTS,
    DEFAULT_ACCENT: DEFAULT_ACCENT,
    get state() { return snapshot(); },
    apply: apply,
    set: set,
    setAccent: function (id) { return set({ accent: id }); },
    /* Custom themes. preview() paints this window only (instant, unsaved); null ends it. */
    get themes() { return state.themes.slice(); },
    BUILTIN_COLORS: BUILTIN_COLORS,
    BUILTIN_THEMES: BUILTIN_THEMES,
    THEME_KEYS: THEME_KEYS,
    themeFromColor: themeFromColor,
    normTheme: normTheme,
    preview: function (colors) {
      var next = colors ? normTheme({ id: 'preview', name: 'p', colors: colors }).colors : null;
      if (JSON.stringify(next) === JSON.stringify(previewColors)) return !!previewColors;
      previewColors = next; paint(); emit(true); // listeners (web bitmap, Dagger art) repaint with the previewed colours
      return !!previewColors;
    },
    saveThemes: function (list, select) { var patch = { themes: list }; if (select !== undefined) patch.accent = select; return set(patch); },
    setPerf: function (m) { return set({ perf: m }); },
    setMotion: function (m) { return set({ motion: m }); },
    setWebs: function (on) { return set({ webs: !!on }); },
    setCharacters: function (on) { return set({ characters: !!on }); },
    setSkin: function (v) { return set({ skin: v }); },
    CUSTOM: CUSTOM,
    DENSITY: DENSITY,
    /** true when decorative motion may run (full motion, not in performance mode). */
    decorative: function () { return resolvedMotion() === 'full' && state.perf !== 'performance'; },
    reduced: function () { return resolvedMotion() === 'reduced'; },
    on: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }
  };
})(typeof window !== 'undefined' ? window : null);
