'use strict';
/* v1.21 — custom order for the Files pinned folders (pins.json in userData).
   reorderPinList(pins, order) → the new list. Only a RE-ARRANGEMENT of the stored pins is
   accepted: unknown or duplicate paths are ignored, nothing is added or dropped, and any pin the
   caller left out keeps its relative place at the end. Pin objects are kept as stored. */
function reorderPinList(pins, order) { return reorderBy(pins, order, 'path'); }
/* v1.22 — the same rule keyed on any field (Sounds folders are keyed by `id`). */
function reorderBy(items, order, key) {
  const list = Array.isArray(items) ? items : [];
  if (!Array.isArray(order)) return list.slice();
  const byKey = new Map(list.map((p) => [p[key], p]));
  const next = [];
  for (const raw of order) {
    const p = byKey.get(String(raw));
    if (p) { next.push(p); byKey.delete(p[key]); }
  }
  for (const p of list) if (byKey.has(p[key])) next.push(p);
  return next;
}
const sameOrder = (a, b) => a.length === b.length && a.every((p, i) => p === b[i]);
module.exports = { reorderPinList, reorderBy, sameOrder };
