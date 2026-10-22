/* Edge grips for transparent frameless windows (Snap).
   Electron 31 cannot user-resize a transparent frameless window on Windows, so the window draws
   eight thin grips. A drag sends the pointer delta (screen px) once per animation frame; main
   applies it to the bounds snapshotted at pointer-down (azy:presets:snapResize), so the window
   follows the pointer exactly and never drifts. Pointer capture keeps the drag alive when the
   cursor leaves the window. */
(function () {
  'use strict';
  const P = window.presets;
  if (!P || typeof P.snapResize !== 'function' || !document.body) return;
  const EDGES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  const host = document.createElement('div');
  host.className = 'azy-grips';
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = EDGES.map((e) => `<i class="azy-grip" data-edge="${e}"></i>`).join('');
  document.body.appendChild(host);

  let drag = null, raf = 0;
  const flush = () => {
    raf = 0;
    if (drag && drag.moved) { drag.moved = false; P.snapResize({ phase: 'move', edge: drag.edge, dx: drag.dx, dy: drag.dy }).catch(() => {}); }
  };
  host.addEventListener('pointerdown', (e) => {
    const g = e.target.closest('.azy-grip');
    if (!g || e.button !== 0) return;
    e.preventDefault();
    g.setPointerCapture(e.pointerId);
    drag = { edge: g.dataset.edge, sx: e.screenX, sy: e.screenY, dx: 0, dy: 0, moved: false, id: e.pointerId };
    document.documentElement.classList.add('azy-resizing');
    P.snapResize({ phase: 'start' }).catch(() => {});
  });
  host.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.screenX - drag.sx; drag.dy = e.screenY - drag.sy; drag.moved = true;
    if (!raf) raf = requestAnimationFrame(flush);
  });
  const end = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    flush();
    drag = null;
    document.documentElement.classList.remove('azy-resizing');
    P.snapResize({ phase: 'end' }).catch(() => {});
  };
  host.addEventListener('pointerup', end);
  host.addEventListener('pointercancel', end);
  host.addEventListener('lostpointercapture', end);
})();
