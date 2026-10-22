/* AZY Characters — the independent layer for original spider-inspired animated characters (v1.12).
 *
 * A single fixed, pointer-events:none layer (z-index below popups, dialogs, menus and toasts) that
 * characters live in. It is:
 *   - independent: nothing else in Azy depends on it; removing this file removes the layer;
 *   - disableable: Settings › Spider companion (uiCharacters), and it switches itself off in
 *     Balanced/Performance quality and reduced motion (<html data-characters="off">);
 *   - non-blocking: characters never receive input and are only placed in empty states, startup,
 *     loading/success moments and unused corners — never over controls.
 *
 * API
 *   azyCharacters.register(id, { states: [...], build(el) })      add a character type
 *   azyCharacters.show(id, { slot, anchor, state, x, y }) → handle   place one (or null when off)
 *   handle.play(state, holdMs?) → handle      handle.hide()          states are CSS-driven
 *   azyCharacters.enabled()                                        layer is on right now
 *   azyCharacters.STATES                                           idle · enter · exit · loading · success ·
 *                                                                  error · swing · zip · crawl · look · land
 *
 * Built in: 'weaver' — the AZY sigil as a tiny spider on a thread. More characters plug in later
 * with register(); none of them need changes anywhere else.
 */
(function (root) {
  'use strict';
  var STATES = ['idle', 'enter', 'exit', 'loading', 'success', 'error', 'swing', 'zip', 'crawl', 'look', 'land'];
  var registry = Object.create(null);
  if (typeof module === 'object' && module.exports) module.exports = { STATES: STATES };
  if (!root || !root.document) return;
  var doc = root.document;
  var layer = null, live = [];

  function enabled() { return doc.documentElement.getAttribute('data-characters') === 'on'; }
  function getLayer() {
    if (layer && layer.isConnected) return layer;
    layer = doc.createElement('div');
    layer.className = 'azy-character-layer';
    layer.setAttribute('aria-hidden', 'true');
    (doc.body || doc.documentElement).appendChild(layer);
    return layer;
  }

  function register(id, def) { registry[id] = def || {}; }

  /* Slots: where a character may appear. All are outside the main control areas. */
  function slotXY(slot, anchor) {
    var vw = root.innerWidth, vh = root.innerHeight;
    if (anchor && anchor.getBoundingClientRect) {
      var r = anchor.getBoundingClientRect();
      return { x: r.left + r.width / 2 - 17, y: Math.max(8, r.top - 44) };
    }
    if (slot === 'corner-tl') return { x: 16, y: 56 };
    if (slot === 'header') {
      // The empty stretch of the header between the sector crumb and the Premiere chip: no controls.
      var copy = doc.querySelector('.app-chrome .workspace-copy'), t = copy && doc.querySelector('.app-chrome .workspace-title');
      if (copy && t) {
        var c = copy.getBoundingClientRect(), tr = t.getBoundingClientRect();
        var free = c.right - tr.right;
        if (free > 90) return { x: Math.round(tr.right + free * 0.55 - 11), y: Math.round(c.top + c.height / 2 - 11) };
      }
      return null;
    }
    if (slot === 'startup' || slot === 'corner-br') return { x: vw - 58, y: vh - 96 };
    return { x: vw - 58, y: vh - 96 };
  }

  function show(id, opts) {
    opts = opts || {};
    if (!enabled() || !registry[id]) return null;
    if (live.length >= 2) return null;                         // never a crowd
    var el = doc.createElement('div');
    el.className = 'azy-character azy-character--' + id;
    var def = registry[id];
    if (def.build) def.build(el);
    var p = opts.x !== undefined ? { x: opts.x, y: opts.y } : slotXY(opts.slot, opts.anchor);
    if (!p) return null;                                       // no free space for this slot: stay away
    if (opts.mini) el.classList.add('azy-character--mini');
    el.style.left = Math.round(p.x) + 'px'; el.style.top = Math.round(p.y) + 'px';
    getLayer().appendChild(el);
    var timer = 0;
    var handle = {
      el: el,
      play: function (state, holdMs) {
        if (STATES.indexOf(state) < 0) return handle;
        el.setAttribute('data-state', state);
        if (def.onState) { try { def.onState(el, state); } catch (e) { /* decorative */ } }
        clearTimeout(timer);
        if (holdMs) timer = setTimeout(function () { handle.hide(); }, holdMs);
        return handle;
      },
      hide: function () {
        clearTimeout(timer);
        el.setAttribute('data-state', 'exit');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); live = live.filter(function (h) { return h !== handle; }); }, 320);
      }
    };
    live.push(handle);
    handle.play(opts.state || 'enter');
    return handle;
  }

  function hideAll() { live.slice().forEach(function (h) { h.hide(); }); }
  /** Let whoever is on screen react to an app moment (e.g. 'look' toward a newly selected sector). */
  function react(state) {
    if (!enabled() || doc.documentElement.hasAttribute('data-busy')) return;
    live.forEach(function (h) { if (h.el.getAttribute('data-state') !== 'exit') h.play(state); });
  }

  // Built-in: the weaver (sigil on a thread).
  register('weaver', {
    states: STATES,
    build: function (el) {
      var thread = doc.createElement('span'); thread.className = 'azy-character-thread'; el.appendChild(thread);
      if (root.azyWeb) root.azyWeb.sigil(el, 'idle');
    },
    onState: function (el, state) {
      var s = el.querySelector('.azy-sigil');
      if (!s || !root.azyWeb) return;
      root.azyWeb.setSigilState(s, state === 'loading' ? 'loading' : state === 'success' ? 'success' : state === 'enter' ? 'appear' : state === 'exit' ? 'dissolve' : 'idle');
    }
  });

  // Turning the layer off (setting, quality mode, reduced motion) clears any character at once.
  doc.addEventListener('azy:themechange', function () { if (!enabled()) hideAll(); });
  // A busy workspace (long tasks, heavy processing) sends any character away at once.
  if (root.MutationObserver) new root.MutationObserver(function () {
    var h = doc.documentElement;
    if (live.length && (h.hasAttribute('data-busy') || h.classList.contains('azy-art-off'))) hideAll();
  }).observe(doc.documentElement, { attributes: true, attributeFilter: ['data-busy', 'class'] });

  /* Startup moment: once per session, after the app is idle, a mini weaver drops into the empty
     part of the header (never over a control), looks around and zips away (~1.8 s). Purely
     decorative; skipped when disabled, busy, or when the header has no free space. */
  function startup() {
    if (!enabled() || root.innerWidth < 560 || !doc.querySelector('#app')) return;
    try { if (root.sessionStorage.getItem('azy.weaver')) return; root.sessionStorage.setItem('azy.weaver', '1'); } catch (e) { /* private mode */ }
    var h = show('weaver', { slot: 'header', state: 'enter', mini: true });
    if (!h) return;
    setTimeout(function () { h.play('look'); }, 520);
    setTimeout(function () { h.hide(); }, 1700);
  }
  var idle = root.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
  root.addEventListener('load', function () { idle(startup, { timeout: 2500 }); }, { once: true });

  root.azyCharacters = { STATES: STATES, register: register, show: show, hideAll: hideAll, react: react, enabled: enabled };
})(typeof window !== 'undefined' ? window : null);
