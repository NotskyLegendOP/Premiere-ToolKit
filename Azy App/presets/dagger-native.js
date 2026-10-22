/* Windows-only native companion for the Azy Dagger.
 *
 * JavaScript can observe global mouse input, but it cannot return synchronously
 * from WH_MOUSE_LL to stop Windows forwarding a right-click to Premiere. The
 * small companion in native/dagger-native.c owns that direct Win32 boundary.
 * This wrapper is intentionally only a private inherited stdin/stdout pipe:
 * no port, no network, no files and no preset data ever leave Azy.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function binaryPath(app) {
  const candidates = [];
  // electron-builder's `asarUnpack: ["assets/**"]` puts the helper here.
  if (process.resourcesPath) {
    candidates.push(path.join(process.resourcesPath, 'app.asar.unpacked', 'assets', 'dagger-native.exe'));
    // Kept as a compatibility candidate for a portable/manual resources layout.
    candidates.push(path.join(process.resourcesPath, 'assets', 'dagger-native.exe'));
  }
  // Development / tests: presets/ → app root → assets.
  candidates.push(path.join(__dirname, '..', 'assets', 'dagger-native.exe'));
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function cleanPart(s) { return String(s == null ? '' : s).replace(/[\r\n\t]/g, ''); }

/**
 * Start the direct Windows input/cursor companion.
 * `onEvent` receives `{ type, ... }`; `onExit` is called exactly once.
 */
function start({ app, onEvent, onExit, onStderr } = {}) {
  if (process.platform !== 'win32') return null;
  const exe = binaryPath(app);
  if (!exe) return null;

  let child;
  try {
    child = spawn(exe, [String(process.pid)], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      // Do not create a shell: the executable and inherited pipe are private to Azy.
      shell: false
    });
  } catch (err) {
    if (onExit) onExit(err);
    return null;
  }

  let stopped = false;
  let exited = false;
  let ready = false;
  let stdoutPending = '';
  let stderrPending = '';
  let killTimer = null;

  const emit = (event) => { try { if (onEvent) onEvent(event); } catch (err) { console.warn('[dagger] native event:', err.message); } };
  const reportExit = (err) => {
    if (exited) return;
    exited = true;
    clearTimeout(killTimer);
    if (onExit) onExit(err || null, { stopped, ready, exe });
  };
  const write = (line) => {
    if (exited || !child.stdin || child.stdin.destroyed) return false;
    try { child.stdin.write(line + '\n'); return true; } catch { return false; }
  };
  const parse = (line) => {
    const p = line.split('\t');
    if (p[0] === 'R') {
      ready = p[1] === '1';
      emit({ type: 'ready', ok: ready, errorCode: Number(p[2]) || 0, exe });
    } else if (p[0] === 'S') {
      emit({ type: 'status', part: cleanPart(p[1]), ok: p[2] === '1', errorCode: Number(p[3]) || 0 });
    } else if (p[0] === 'O') {
      emit({ type: 'open', wheel: cleanPart(p[1]), x: Number(p[2]), y: Number(p[3]), session: Number(p[4]) || 0 });
    } else if (p[0] === 'M') {
      emit({ type: 'move', x: Number(p[1]), y: Number(p[2]), session: Number(p[3]) || 0 });
    } else if (p[0] === 'X') {
      emit({ type: 'close', commit: p[1] === '1', session: Number(p[2]) || 0 });
    }
  };
  const drain = (which) => {
    let pending = which === 'out' ? stdoutPending : stderrPending;
    let at;
    while ((at = pending.indexOf('\n')) >= 0) {
      const line = pending.slice(0, at).replace(/\r$/, '');
      pending = pending.slice(at + 1);
      if (which === 'out') { if (line) parse(line); }
      else if (line && onStderr) onStderr(line);
    }
    if (which === 'out') stdoutPending = pending.slice(-4096);
    else stderrPending = pending.slice(-4096);
  };

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { stdoutPending += chunk; drain('out'); });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => { stderrPending += chunk; drain('err'); });
  child.once('error', (err) => reportExit(err));
  child.once('exit', (code, signal) => {
    const detail = stopped ? null : new Error(`The Dagger native helper stopped${code == null ? '' : ` (code ${code})`}${signal ? ` (${signal})` : ''}`);
    reportExit(detail);
  });

  return {
    get ready() { return ready && !exited; },
    get alive() { return !exited; },
    get stopped() { return stopped; },
    get exe() { return exe; },
    configure(enabled, bindings) {
      const wheelIds = ['main', 'sfx', 'presets', 'flow'];
      const bits = ['C', enabled ? '1' : '0'];
      if (enabled) {
        for (const id of wheelIds) {
          const b = bindings && bindings[id];
          if (!b) continue;
          // strtok-style parsing in the tiny native companion intentionally has no empty field;
          // use a harmless explicit marker for a valid no-modifier middle/side-button binding.
          bits.push(id, cleanPart(b.modifier) || '-', String(Number(b.button) || 0), b.mode === 'toggle' ? '1' : '0', String(Number(b.key) || 0));
        }
      }
      return write(bits.join('\t'));
    },
    preview(wheel) { return write(`V\t${cleanPart(wheel)}`); },
    // A session id makes delayed preview cancellation / cursor restoration safe
    // across an immediate close-and-reopen. Bare commands remain compatible with
    // protocol harnesses and older helpers.
    cancel(session) { return write(session ? `K\t${Number(session) || 0}` : 'K'); },
    restore(session) { return write(session ? `R\t${Number(session) || 0}` : 'R'); }, 
    stop() {
      if (exited || stopped) return;
      stopped = true;
      write('Q');
      // Q restores the cursor before exit. The fallback only covers a wedged process.
      killTimer = setTimeout(() => { if (!exited) { try { child.kill(); } catch { /* gone */ } } }, 800);
      if (killTimer.unref) killTimer.unref();
    }
  };
}

module.exports = { start, binaryPath };
