/* Azy Undo — one stack per window, Ctrl+Z to take it back, Ctrl+Shift+Z to put it forward.
 *
 * The rule of the house: if Azy changed something, one keystroke changes it back. Surfaces call
 * this instead of inventing their own "Revert" buttons, so the whole app undoes the same way.
 *
 *   window.azyUndo.record({ label, undo, redo, id })   // something already happened; remember it
 *   window.azyUndo.run({ label, apply, undo })         // do it *and* remember it, in one call
 *   window.azyUndo.group('Renamed 3 files', () => {…}) // several records → one Ctrl+Z
 *
 * Entries are closures, not serialised state, so undo runs through the same code path the UI
 * uses (same IPC, same repaint, same broadcast to the other windows) and can never drift from
 * it. `id` coalesces a burst of the same kind of change — clicking through ten cards is one
 * undo, not ten. `suspended` keeps our own undo work from being recorded as a new action.
 *
 * Nothing here can throw into a caller: an entry that fails is dropped with a toast, so a bad
 * undo never takes the panel down, and Azy keeps working.
 */
(function () {
  const MAX = 80;
  const undoStack = [];
  const redoStack = [];
  let suspended = false;
  let grouping = null; // { label, records: [] } while a group is open

  // The app's own toast(), reached however this file happens to be loaded: as a page script it is
  // on window, inside a bundled/test scope it is a sibling declaration, and in neither case may a
  // missing toast turn into an error on top of the action it is describing.
  function toast(msg, ms) {
    try {
      if (typeof window !== 'undefined' && typeof window.toast === 'function') return window.toast(msg, ms);
    } catch (_) { /* no toast layer */ }
    return undefined;
  }

  function push(entry) {
    undoStack.push(entry);
    if (undoStack.length > MAX) undoStack.shift();
  }

  function record(entry) {
    if (!entry || typeof entry.undo !== 'function') return entry;
    if (suspended) return entry;
    if (grouping) { grouping.records.push(entry); return entry; }
    // A burst of the same thing (selection clicks, dragging a slider, tab-to-tab) collapses into
    // the entry already on top, so one Ctrl+Z reverses the whole burst, not one click of it.
    // Coalescing keeps the *way back* from the first entry of the run (that is the state the user
    // had before they started) and the *way forward* from the last one (where they ended up).
    // Taking both from the newest entry would undo one step out of three and look broken.
    const top = undoStack[undoStack.length - 1];
    if (entry.id && top && top.id === entry.id) {
      undoStack[undoStack.length - 1] = { ...entry, undo: top.undo, before: top.before !== undefined ? top.before : entry.before, label: entry.label || top.label };
    } else push(entry);
    redoStack.length = 0;
    return entry;
  }

  // Run an action and record how to take it back. `apply` may return a promise; the record is
  // only made once it has actually succeeded, so a failed write never enters the stack.
  function run(entry) {
    const out = entry && entry.apply ? entry.apply() : undefined;
    if (out && typeof out.then === 'function') {
      return out.then((v) => { record({ ...entry, result: v }); return v; },
        (e) => { throw e; });
    }
    record(entry);
    return out;
  }

  // While an entry runs, recording is switched off: the state broadcasts that follow (the same
  // setting arriving in the other windows, a repaint, a re-render of the grid) are consequences
  // of the undo, not new actions. If the entry returns a promise the guard stays up until it
  // settles, so an async undo cannot leak its own completion back onto the stack.
  function fire(entry, which) {
    const fn = entry && entry[which];
    if (typeof fn !== 'function') return false;
    suspended = true;
    const failed = () => {
      suspended = false;
      toast(`Could not ${which === 'undo' ? 'undo' : 'redo'}: ${entry.label || 'that'}`, 2400);
      return false;
    };
    try {
      const out = fn(entry.before);
      if (out && typeof out.then === 'function') {
        return out.then(() => { suspended = false; return true; }, failed);
      }
      suspended = false;
      return true;
    } catch (_) { return failed(); }
  }

  function travel(from, to, direction) {
    // Do not pop or announce success while a disk/IPC write is still pending. A rejected
    // write keeps the original entry available, and repeated Ctrl+Z cannot race it.
    if (suspended) return false;
    if (!from.length) { toast(`Nothing to ${direction}`, 1200); return false; }
    const entry = from[from.length - 1];
    const which = direction === 'redo' && !entry.redo ? 'apply' : direction;
    const settle = (ok) => {
      if (!ok) return false;
      if (from[from.length - 1] === entry) { from.pop(); to.push(entry); }
      // Never overwrite connection health with an undo message.
      toast(`${direction === 'undo' ? 'Undid' : 'Redid'} — ${entry.label || 'action'}`, 1400);
      return true;
    };
    const out = fire(entry, which);
    return out && typeof out.then === 'function' ? out.then(settle) : settle(out);
  }

  function undo() { return travel(undoStack, redoStack, 'undo'); }
  function redo() { return travel(redoStack, undoStack, 'redo'); }

  function group(label, fn) {
    if (grouping) return fn(); // nested groups flatten into the outer one
    grouping = { label, records: [] };
    try { return fn(); }
    finally {
      const g = grouping; grouping = null;
      if (g.records.length) {
        // Undo in reverse order, redo forwards — the group behaves like one action.
        record({
          label: g.label,
          group: true,
          undo: async () => { for (let i = g.records.length - 1; i >= 0; i--) await g.records[i].undo(g.records[i].before); },
          redo: async () => { for (const entry of g.records) { const fn = entry.redo || entry.apply; if (!fn) throw new Error('No redo'); await fn(entry.before); } },
        });
      }
    }
  }

  const isTyping = (t) => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);

  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
    if (isTyping(e.target)) return; // the field's own undo is the right one while you type
    e.preventDefault();
    if (e.shiftKey) redo(); else undo();
  }, true);

  window.azyUndo = {
    record, run, group, undo, redo,
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    next: () => (undoStack.length ? undoStack[undoStack.length - 1].label : ''),
    clear: () => { undoStack.length = 0; redoStack.length = 0; },
    // Let a surface move things around without the stack treating it as a user action (boot,
    // restoring a saved layout, reacting to another window's broadcast).
    quiet: (fn) => { const was = suspended; suspended = true; try { return fn(); } finally { suspended = was; } },
  };
})();
