/* AZY UI foundation — glass tooltips, menus, dialogs and the global feedback helpers (v1.12).
 *
 *   azyUI.dialog({ title, message, kind, actions })   → Promise<value | null>
 *   azyUI.confirm(title, message, { okLabel, danger }) → Promise<boolean>
 *   azyUI.menu(items, at)                              → Promise<value | null>   (context / dropdown / command)
 *   azyUI.tooltip.show(el, text) / .hide()             (plus automatic [data-tip] / [title] hover tips)
 *   azyUI.success(target, message?)                    brief accent/ok ripple, optional small toast
 *   azyUI.error(target, message, { dialog, action })   dark glass notice with a clear message
 *   azyUI.busy(el, promise)                            instant loading state; returns the SAME promise
 *
 * Principle: CLICK → IMMEDIATE VISUAL RESPONSE → ACTION STARTS → RESULT. Nothing here awaits an
 * animation before resolving, and every visual is skipped or simplified by the theme engine's
 * quality / motion dials. All surfaces use the foundation classes in presets/azy-foundation.css.
 * Text is always set with textContent — no HTML injection paths.
 */
(function (root) {
  'use strict';
  if (!root || !root.document) return;
  var doc = root.document;
  var fx = function (t, k, o) { try { return root.azyWeb ? root.azyWeb.fx(t, k, o) : null; } catch (e) { return null; } };

  // ─── tooltips ───────────────────────────────────────────────────────────────────────
  var tip = null, tipFor = null, tipTimer = 0, lastHide = 0;
  function tipEl() {
    if (tip && tip.isConnected) return tip;
    tip = doc.createElement('div');
    tip.className = 'azy-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.id = 'azyTooltip';
    (doc.body || doc.documentElement).appendChild(tip);
    return tip;
  }
  function place(el) {
    var t = tipEl(), r = el.getBoundingClientRect(), tr = t.getBoundingClientRect();
    var vw = root.innerWidth, vh = root.innerHeight;
    var x = Math.round(Math.min(vw - tr.width - 6, Math.max(6, r.left + r.width / 2 - tr.width / 2)));
    var y = Math.round(r.bottom + 6);
    if (y + tr.height > vh - 4) y = Math.round(r.top - tr.height - 6);
    t.style.transform = ''; t.style.left = x + 'px'; t.style.top = y + 'px';
  }
  function showTip(el, text) {
    if (!el || !text) return;
    var t = tipEl();
    t.textContent = text;
    tipFor = el;
    el.setAttribute('aria-describedby', 'azyTooltip');
    place(el);
    t.classList.add('is-on');
  }
  function restoreTitle(el) {
    if (el && el.hasAttribute('data-azy-title')) { el.setAttribute('title', el.getAttribute('data-azy-title')); el.removeAttribute('data-azy-title'); }
  }
  function hideTip() {
    clearTimeout(tipTimer); tipTimer = 0;
    if (tipFor) { tipFor.removeAttribute('aria-describedby'); restoreTitle(tipFor); lastHide = Date.now(); }
    tipFor = null;
    if (tip) tip.classList.remove('is-on');
  }
  var TIP_SEL = '[data-tip], [title]:not(svg *):not(iframe):not(input[type="range"])';
  doc.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch') return;
    var el = e.target && e.target.closest ? e.target.closest(TIP_SEL) : null;
    if (!el || el === tipFor || el.closest('[data-notip]')) return;
    hideTip();
    // Warm path: moving between controls while a tip was just shown feels instant.
    var delay = Date.now() - lastHide < 500 ? 40 : 360;
    tipTimer = setTimeout(function () {
      tipTimer = 0;
      if (!el.isConnected || !el.matches(':hover')) return;
      var text = el.getAttribute('data-tip');
      if (!text && el.hasAttribute('title')) {
        text = el.getAttribute('title');
        // Take the title over only while the glass tip is showing (native tip suppressed), then give it back.
        el.setAttribute('data-azy-title', text); el.removeAttribute('title');
      }
      showTip(el, text);
    }, delay);
  }, true);
  doc.addEventListener('pointerout', function (e) {
    if (!tipFor && !tipTimer) return;
    var to = e.relatedTarget;
    if (tipFor && to && tipFor.contains(to)) return;
    hideTip();
  }, true);
  ['pointerdown', 'keydown', 'wheel', 'scroll', 'blur'].forEach(function (ev) { (ev === 'blur' ? root : doc).addEventListener(ev, function () { if (tipFor || tipTimer) hideTip(); }, { capture: true, passive: true }); });

  // ─── menus ──────────────────────────────────────────────────────────────────────────
  var openMenu = null;
  function closeMenu(value) { if (openMenu) { var m = openMenu; openMenu = null; m.close(value); } }
  /**
   * items: [{ label, value, kbd, danger, disabled, icon? } | '-' | { heading }]
   * at: { x, y } | Element (dropdown under it) | MouseEvent (context menu)
   */
  function menu(items, at) {
    closeMenu(null);
    return new Promise(function (resolve) {
      var el = doc.createElement('div');
      el.className = 'azy-menu';
      el.setAttribute('role', 'menu');
      var buttons = [];
      (items || []).forEach(function (it) {
        if (it === '-') { var s = doc.createElement('div'); s.className = 'azy-menu-sep'; el.appendChild(s); return; }
        if (it && it.heading) { var h = doc.createElement('div'); h.className = 'azy-menu-label'; h.textContent = it.heading; el.appendChild(h); return; }
        var b = doc.createElement('button');
        b.type = 'button'; b.className = 'azy-menu-item' + (it.danger ? ' azy-menu-item--danger' : '');
        b.setAttribute('role', 'menuitem');
        var l = doc.createElement('span'); l.textContent = it.label; b.appendChild(l);
        if (it.kbd) { var k = doc.createElement('span'); k.className = 'azy-menu-kbd'; k.textContent = it.kbd; b.appendChild(k); }
        if (it.disabled) b.disabled = true;
        b.addEventListener('click', function () { closeMenu(it.value !== undefined ? it.value : it.label); });
        el.appendChild(b); buttons.push(b);
      });
      (doc.body || doc.documentElement).appendChild(el);
      var x = 0, y = 0;
      if (at && at.getBoundingClientRect && !(at instanceof root.Event)) { var r = at.getBoundingClientRect(); x = r.left; y = r.bottom + 4; }
      else if (at) { x = at.clientX !== undefined ? at.clientX : at.x || 0; y = at.clientY !== undefined ? at.clientY : at.y || 0; }
      var mr = el.getBoundingClientRect();
      x = Math.max(4, Math.min(x, root.innerWidth - mr.width - 4));
      y = Math.max(4, Math.min(y, root.innerHeight - mr.height - 4));
      el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px';
      var prevFocus = doc.activeElement;
      var onDown = function (e) { if (!el.contains(e.target)) closeMenu(null); };
      var onKey = function (e) {
        var i = buttons.indexOf(doc.activeElement);
        if (e.key === 'Escape') { e.preventDefault(); closeMenu(null); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); (buttons[(i + 1) % buttons.length] || buttons[0]).focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); (buttons[(i - 1 + buttons.length) % buttons.length] || buttons[0]).focus(); }
      };
      var onResize = function () { closeMenu(null); };
      setTimeout(function () { doc.addEventListener('pointerdown', onDown, true); }, 0);
      doc.addEventListener('keydown', onKey, true);
      root.addEventListener('resize', onResize);
      root.addEventListener('blur', onResize);
      openMenu = {
        el: el,
        close: function (value) {
          doc.removeEventListener('pointerdown', onDown, true);
          doc.removeEventListener('keydown', onKey, true);
          root.removeEventListener('resize', onResize);
          root.removeEventListener('blur', onResize);
          if (el.parentNode) el.parentNode.removeChild(el);
          if (prevFocus && prevFocus.focus && value === null) { try { prevFocus.focus({ preventScroll: true }); } catch (e) { /* gone */ } }
          resolve(value);
        }
      };
      if (buttons[0]) buttons[0].focus({ preventScroll: true });
    });
  }

  // ─── dialogs ────────────────────────────────────────────────────────────────────────
  /**
   * opts: { title, message, kind: 'info'|'confirm'|'error'|'success', actions: [{ label, value, primary, danger }],
   *         dismissable (default true) }
   * Resolves with the chosen action's value (Escape / backdrop → null). Resolution happens on the
   * click itself; the ~90 ms exit fade runs afterwards and never delays the caller.
   */
  function dialog(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var overlay = doc.createElement('div');
      overlay.className = 'azy-overlay';
      var box = doc.createElement('div');
      box.className = 'azy-dialog' + (opts.kind === 'error' ? ' azy-dialog--error' : '');
      box.setAttribute('role', opts.kind === 'error' ? 'alertdialog' : 'dialog');
      box.setAttribute('aria-modal', 'true');
      var head = doc.createElement('div'); head.className = 'azy-dialog-head';
      if (root.azyWeb) root.azyWeb.sigil(head, opts.kind === 'error' ? 'active' : opts.kind === 'success' ? 'success' : 'appear');
      var h = doc.createElement('h2'); h.className = 'azy-dialog-title'; h.id = 'azyDialogTitle' + Date.now(); h.textContent = opts.title || '';
      head.appendChild(h); box.appendChild(head);
      box.setAttribute('aria-labelledby', h.id);
      if (opts.message) { var b = doc.createElement('div'); b.className = 'azy-dialog-body'; b.textContent = opts.message; box.appendChild(b); }
      var foot = doc.createElement('div'); foot.className = 'azy-dialog-foot';
      var actions = opts.actions && opts.actions.length ? opts.actions : [{ label: 'OK', value: true, primary: true }];
      var primary = null, done = false;
      function finish(value) {
        if (done) return; done = true;
        doc.removeEventListener('keydown', onKey, true);
        resolve(value);                                      // result first …
        overlay.classList.add('is-closing');                 // … exit visuals after
        setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); if (prev && prev.focus) { try { prev.focus({ preventScroll: true }); } catch (e) { /* gone */ } } }, 110);
      }
      actions.forEach(function (a) {
        var btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'azy-btn' + (a.primary ? ' azy-btn--primary' : a.danger ? ' azy-btn--danger' : '');
        btn.textContent = a.label;
        btn.addEventListener('click', function () { finish(a.value !== undefined ? a.value : a.label); });
        foot.appendChild(btn);
        if (a.primary && !primary) primary = btn;
      });
      box.appendChild(foot);
      overlay.appendChild(box);
      var prev = doc.activeElement;
      var onKey = function (e) {
        if (e.key === 'Escape' && opts.dismissable !== false) { e.preventDefault(); e.stopPropagation(); finish(null); }
        else if (e.key === 'Tab') {                           // keep focus inside the dialog
          var f = box.querySelectorAll('button'); if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      overlay.addEventListener('pointerdown', function (e) { if (e.target === overlay && opts.dismissable !== false) finish(null); });
      doc.addEventListener('keydown', onKey, true);
      (doc.body || doc.documentElement).appendChild(overlay);
      (primary || foot.querySelector('button')).focus({ preventScroll: true });
      fx(box, 'draw', { at: 'rect' });
    });
  }
  function confirm(title, message, o) {
    o = o || {};
    return dialog({ title: title, message: message, kind: 'confirm', actions: [
      { label: o.cancelLabel || 'Cancel', value: false },
      o.danger ? { label: o.okLabel || 'Continue', value: true, danger: true } : { label: o.okLabel || 'Continue', value: true, primary: true }
    ] }).then(function (v) { return v === true; });
  }

  // ─── feedback ───────────────────────────────────────────────────────────────────────
  function mark(el, cls, ms) {
    if (!el || !el.classList) return;
    el.classList.remove('is-success', 'is-error');
    el.classList.add(cls);
    clearTimeout(el._azyMark);
    el._azyMark = setTimeout(function () { el.classList.remove(cls); }, ms || 700);
  }
  function success(target, message) {
    if (target && target.classList) mark(target, 'is-success', 700);
    if (target) fx(target, 'ripple', { tone: 'ok' });
    if (message && root.toast) root.toast(message, 1400);
  }
  function error(target, message, o) {
    o = o || {};
    if (target && target.classList) mark(target, 'is-error', 900);
    if (target) fx(target, 'break', { tone: 'err' });
    if (!message) return Promise.resolve(null);
    if (o.dialog || o.action) {
      var acts = [{ label: 'Close', value: null }];
      if (o.action) acts.push({ label: o.action.label, value: 'action', primary: true });
      return dialog({ title: o.title || 'Something went wrong', message: message, kind: 'error', actions: acts }).then(function (v) {
        if (v === 'action' && o.action && o.action.run) o.action.run();
        return v;
      });
    }
    if (root.toast) root.toast(message, 2600);
    return Promise.resolve(null);
  }
  function busy(el, promise) {
    if (el && el.classList) el.classList.add('is-loading');           // immediate
    var p = Promise.resolve(promise);
    p.then(function () { if (el && el.classList) { el.classList.remove('is-loading'); success(el); } },
           function () { if (el && el.classList) { el.classList.remove('is-loading'); error(el); } });
    return p;                                                         // the caller gets the operation, untouched
  }

  // ─── event-driven web moments (delegated, no per-element listeners) ─────────────────
  doc.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    var nav = t.closest('.mode-tab, .settings-cat');
    if (nav) { fx(nav, 'snap', { size: 64 }); return; }
    var theme = t.closest('#themeSeg [data-theme]');
    if (theme) fx({ x: e.clientX, y: e.clientY }, 'ripple', { size: 220 });
  }, true);

  root.azyUI = { dialog: dialog, confirm: confirm, menu: menu, closeMenu: closeMenu,
    tooltip: { show: showTip, hide: hideTip }, success: success, error: error, busy: busy };
})(typeof window !== 'undefined' ? window : null);
