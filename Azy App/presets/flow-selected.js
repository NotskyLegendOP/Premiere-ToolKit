'use strict';
/*
 * Native "Selected" keyframe detection for Flow.
 *
 * Premiere never exposes which keyframes are highlighted in the Effect Controls panel —
 * not to CEP ExtendScript, not to the QE DOM, not to UXP (verified against every public
 * API surface). But Premiere itself knows, and it acts on exactly those keys when the
 * user presses Delete. So instead of asking Premiere *which* keys are highlighted, Azy
 * watches what Premiere does:
 *
 *   1. read the complete keyframe inventory of the selected clip(s) — every param,
 *      every key time, and (for safety) every value. This is the ONE read that carries
 *      values: it is the pre-Delete snapshot the restore fallback re-adds from if
 *      Ctrl+Z ever fails. Every re-read below is ticks-only (flowKeyframes with
 *      withValues:false), so Premiere's getValueAtKey is not hammered while Azy polls
 *      for Delete/Undo to land — the probe's cost stops scaling with keyframe count
 *      beyond that single snapshot;
 *   2. bring Effect Controls to the keyboard front with Premiere's own default panel
 *      shortcut (Shift+5, unchanged since CC). Without this step Delete lands wherever
 *      the user last clicked — usually the timeline with nothing selected — and
 *      silently does nothing, which is exactly how detection used to fail;
 *   3. send Delete to Premiere. Effect Controls deletes ONLY the highlighted keys;
 *   4. read the inventory again (ticks only) — the keys that disappeared are the
 *      highlighted ones. If nothing changed (Shift+5 remapped, panel already focused
 *      elsewhere) Azy retries once with a plain Delete before giving up;
 *   5. send Ctrl+Z. Premiere restores them exactly (values, interpolation, all);
 *   6. verify the restore key-for-key. If any key did not come back, Azy re-adds it
 *      from the values captured in step 1 (restoreKeys) and says so in a warning;
 *   7. hand the exact {clip, component, param, ticks[]} list to flow.apply, which the
 *      connector filters down to before easing — no other keyframe is touched.
 *
 * If nothing was highlighted (or focus was not on Effect Controls) the inventory does
 * not change, Ctrl+Z is NEVER sent (it would eat the user's own last undo step), and
 * the apply is refused with guidance. The probe is non-destructive by construction:
 * the only Premiere actions are Delete-then-Undo of Premiere's own doing.
 *
 * Keystrokes are delivered with the OS-native sender (PowerShell WScript.Shell on
 * Windows, System Events on macOS) after activating the Premiere window by PID.
 * The first keystroke is Premiere's default Effect Controls focus shortcut (Shift+5),
 * so the following Delete reaches the panel that owns the highlighted keys no matter
 * where the user's last click inside Premiere was; the panel click that starts the
 * apply is prevented from stealing focus (see flow-renderer.js) as a second guard.
 *
 * The same probe powers Flow's "Move Selected Keyframes → playhead" (presets-main.js
 * moveFlow): the detected {clip, component, param, ticks[]} list is handed to the
 * connector's moveKeys, which computes ONE offset from the fresh playhead read and has
 * the host translate every key in a single undoable call.
 */
const { execFile, spawn } = require('child_process');
const fsNode = require('fs');
const osNode = require('os');
const pathNode = require('path');

const POLL_MS = 150;          // inventory re-read cadence while waiting for Premiere to react (v1.19: 250 → 150, ticks-only reads are cheap)
const DELETE_TIMEOUT_MS = 3000; // how long Delete may take to show up in the inventory
const UNDO_TIMEOUT_MS = 4000;   // how long the Ctrl+Z restore may take
const FOCUS_SETTLE_MS = 400;    // let Effect Controls take the keyboard after Shift+5
const INVENTORY_TIMEOUT_MS = 30000;

// Tests (and only tests) may tighten the probe clock through the environment.
function envInt(name, fallback) {
  const v = parseInt(process.env[name], 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function probeError(code, message) {
  const e = new Error(message);
  e.code = code;
  return e;
}

/* ------------------------------------------------------------------ keystroke senders */

/* ------------------------------------------------------------------ warm key host (v1.19)

   Launching powershell.exe, loading System.Windows.Forms and creating the WScript.Shell COM object
   costs several hundred ms on Windows — and the probe sends three keys per apply (focus, Delete,
   Ctrl+Z). The key host is ONE PowerShell process kept warm for a while: it reads "<id> <action>"
   lines on stdin and answers "<id> OK" / "<id> ERR <code> <message>". The action → key map is a
   fixed whitelist on BOTH sides; no text from Azy is ever executed.

   Safety rules:
     • it falls back to the one-shot sender ONLY when the host fails to start — i.e. before any key
       was written — so a key can never be sent twice;
     • a call that times out kills the host (a late key can't land afterwards) and is reported as a
       failure, never retried;
     • idle for KEYHOST_IDLE_MS (25 min since the last key) → powershell.exe exits; it also exits by itself when Azy closes (stdin EOF). */
const KEYHOST_IDLE_MS = 25 * 60 * 1000; // v1.19: powershell.exe closes after 25 minutes idle
const KEY_ACTIONS = { focusEcp: '+5', delete: '{DELETE}', undo: '^z' };
/* v1.21 — no more Windows "ding" on a successful Flow. WScript's AppActivate could leave Premiere's
   menu bar armed (or hand the keys to a window that doesn't own the keyboard), so the Shift+5 focus
   key had no menu match and Windows played its error sound — while the following Delete still
   worked. The host now compiles this tiny native helper once: when Premiere is ALREADY the
   foreground app nothing is activated at all; otherwise it is brought forward with a proper
   foreground hand-off and VERIFIED to own the foreground before a key is sent (else nothing is
   sent). Keys go out as real virtual keys (Delete as the extended key, not numpad). If the helper
   can't compile, the previous WScript path runs unchanged. */
const NATIVE_KEYS_CS = 'using System; using System.Runtime.InteropServices; using System.Threading; public static class AzyKeys { [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow(); [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid); [DllImport("user32.dll")] static extern bool AttachThreadInput(uint a, uint b, bool f); [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h); [DllImport("user32.dll")] static extern bool BringWindowToTop(IntPtr h); [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr h, int c); [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h); [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId(); [DllImport("user32.dll")] static extern void keybd_event(byte vk, byte sc, uint f, UIntPtr x); [DllImport("user32.dll")] static extern uint MapVirtualKey(uint c, uint t); [DllImport("user32.dll")] static extern short GetAsyncKeyState(int v); [StructLayout(LayoutKind.Sequential)] public struct GuiRect { public int l; public int t; public int r; public int b; } [StructLayout(LayoutKind.Sequential)] public struct GuiInfo { public int cbSize; public int flags; public IntPtr hwndActive; public IntPtr hwndFocus; public IntPtr hwndCapture; public IntPtr hwndMenuOwner; public IntPtr hwndMoveSize; public IntPtr hwndCaret; public GuiRect rc; } [DllImport("user32.dll")] static extern bool GetGUIThreadInfo(uint tid, ref GuiInfo g); [DllImport("user32.dll")] static extern IntPtr SendMessageTimeout(IntPtr h, uint m, IntPtr w, IntPtr l, uint f, uint t, out IntPtr r); public static bool ModsHeld() { int[] v = { 0x10, 0x11, 0x12, 0x5B, 0x5C }; foreach (int k in v) { if ((GetAsyncKeyState(k) & 0x8000) != 0) return true; } return false; } public static int WaitMods(int ms) { for (int n = 0; ModsHeld() && n < ms; n += 15) Thread.Sleep(15); return ModsHeld() ? 0 : 1; } static bool InMenu(uint tid) { GuiInfo g = new GuiInfo(); g.cbSize = Marshal.SizeOf(typeof(GuiInfo)); return GetGUIThreadInfo(tid, ref g) && (g.flags & 0x1C) != 0; } public static int CancelMenu() { IntPtr fg = GetForegroundWindow(); uint p; uint tid = GetWindowThreadProcessId(fg, out p); GuiInfo g = new GuiInfo(); g.cbSize = Marshal.SizeOf(typeof(GuiInfo)); if (tid == 0 || !GetGUIThreadInfo(tid, ref g) || (g.flags & 0x1C) == 0) return 1; IntPtr t = g.hwndMenuOwner != IntPtr.Zero ? g.hwndMenuOwner : (g.hwndActive != IntPtr.Zero ? g.hwndActive : fg); IntPtr r; SendMessageTimeout(t, 0x1F, IntPtr.Zero, IntPtr.Zero, 2, 300, out r); for (int i = 0; i < 20; i++) { if (!InMenu(tid)) return 2; Thread.Sleep(15); } return 0; } public static bool IsFront(int pid) { uint p; GetWindowThreadProcessId(GetForegroundWindow(), out p); return p == (uint)pid; } public static int Front(int pid, long hwnd) { if (IsFront(pid)) return 1; IntPtr h = new IntPtr(hwnd); if (h == IntPtr.Zero) return 0; if (IsIconic(h)) ShowWindow(h, 9); uint d; uint fg = GetWindowThreadProcessId(GetForegroundWindow(), out d); uint me = GetCurrentThreadId(); bool att = fg != 0 && fg != me && AttachThreadInput(me, fg, true); SetForegroundWindow(h); BringWindowToTop(h); if (att) AttachThreadInput(me, fg, false); for (int i = 0; i < 20 && !IsFront(pid); i++) Thread.Sleep(15); return IsFront(pid) ? 2 : 0; } static void K(byte vk, bool up, bool ext) { keybd_event(vk, (byte)MapVirtualKey(vk, 0), (up ? 2u : 0u) | (ext ? 1u : 0u), UIntPtr.Zero); } public static void Send(string act) { if (act == "focusEcp") { K(0x10, false, false); K(0x35, false, false); K(0x35, true, false); K(0x10, true, false); } else if (act == "delete") { K(0x2E, false, true); K(0x2E, true, true); } else if (act == "undo") { K(0x11, false, false); K(0x5A, false, false); K(0x5A, true, false); K(0x11, true, false); } } }';
const KEYHOST_PS = [
  "$ErrorActionPreference = 'Stop'",
  "function Out-Line($s) { [Console]::Out.WriteLine($s); [Console]::Out.Flush() }",
  "try { Add-Type -AssemblyName System.Windows.Forms; $w = New-Object -ComObject WScript.Shell } catch { Out-Line ('FAIL ' + $_.Exception.Message); exit 2 }",
  "$keys = @{ focusEcp = '+5'; delete = '{DELETE}'; undo = '^z' }",
  "$native = $false",
  "try { Add-Type -TypeDefinition '" + NATIVE_KEYS_CS + "' -Language CSharp; $native = $true } catch { $native = $false }",
  "Out-Line 'READY'",
  'while ($true) {',
  '  $line = [Console]::In.ReadLine()',
  '  if ($line -eq $null) { break }',
  "  $parts = $line.Trim().Split(' ')",
  '  if ($parts.Count -lt 2) { continue }',
  '  $id = $parts[0]; $act = $parts[1]',
  "  if ($act -eq 'ping') { Out-Line \"$id OK\"; continue }",
  "  if ($act -eq 'mode') { if ($native) { Out-Line \"$id OK native\" } else { Out-Line \"$id OK wscript\" }; continue }",
  "  if (-not $keys.ContainsKey($act)) { Out-Line \"$id ERR 5 unknown action\"; continue }",
  '  try {',
  "    $p = Get-Process | Where-Object { $_.ProcessName -like 'Adobe Premiere Pro*' -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1",
  "    if (-not $p) { Out-Line \"$id ERR 3 Premiere Pro is not running\"; continue }",
  '    if ($native) {',
  // v1.22: wait on the PHYSICAL keyboard (GetAsyncKeyState). Control.ModifierKeys is GetKeyState, which only
  // tracks this console thread's own queue and always reads "released" here — so the old wait never waited.
  // A held Ctrl/Shift/Alt/Win (Dagger Flow gesture, Ctrl+Alt+P, Shift/Alt-click) then merged with the
  // injected key: Alt+Shift+5 has no menu match, so Windows played its error sound.
  "      if ([AzyKeys]::WaitMods(2500) -eq 0) { Out-Line \"$id ERR 6 a Ctrl, Shift, Alt or Windows key is still held down\"; continue }",
  '      $f = [AzyKeys]::Front([int]$p.Id, [long]$p.MainWindowHandle)',
  "      if ($f -eq 0) { Out-Line \"$id ERR 4 could not bring Premiere to the front\"; continue }",
  '      if ($f -eq 2) { Start-Sleep -Milliseconds 120 }',
  // v1.22: releasing Alt over Premiere arms its menu bar; the next key then has no menu match, Windows dings
  // and the key is eaten. Leave menu mode with WM_CANCELMODE (only when Premiere reports menu mode; no key).
  "      if ([AzyKeys]::CancelMenu() -eq 0) { Out-Line \"$id ERR 7 the Premiere menu bar is open\"; continue }",
  "      if ([AzyKeys]::ModsHeld()) { Out-Line \"$id ERR 6 a Ctrl, Shift, Alt or Windows key is still held down\"; continue }",
  '      [AzyKeys]::Send($act)',
  '    } else {',
  // WScript fallback only: the previous modifier wait, unchanged.
  "      $n = 0; while (([System.Windows.Forms.Control]::ModifierKeys -ne 'None') -and ($n -lt 60)) { Start-Sleep -Milliseconds 25; $n++ }",
  "      if (-not $w.AppActivate([int]$p.Id)) { Out-Line \"$id ERR 4 could not bring Premiere to the front\"; continue }",
  '      Start-Sleep -Milliseconds 120',
  '      $w.SendKeys($keys[$act])',
  '    }',
  // v1.21: the 220 ms settle stays for Shift+5 (it is part of the Effect Controls focus settle).
  // After Delete / Ctrl+Z it was dead time — the probe polls Premiere until it sees the change.
  "    if ($act -eq 'focusEcp') { Start-Sleep -Milliseconds 220 } else { Start-Sleep -Milliseconds 30 }",
  "    Out-Line \"$id OK\"",
  "  } catch { Out-Line (\"$id ERR 5 \" + $_.Exception.Message) }",
  '}'
].join('\r\n');

/**
 * createKeyHost({ command, args, spawn, readyMs, callMs, idleMs }) → { send(action), warm(), stop(), alive }
 * send() rejects with code HOST_START_FAILED only when nothing was written to the host.
 */
function createKeyHost(spec) {
  const spawnFn = spec.spawn || spawn;
  const readyMs = spec.readyMs || 8000, callMs = spec.callMs || 15000, idleMs = spec.idleMs || KEYHOST_IDLE_MS;
  let child = null, starting = null, buf = '', seq = 0, idleTimer = null;
  const pending = new Map();
  function failAll(code, message) {
    for (const [, p] of pending) { clearTimeout(p.timer); p.reject(probeError(code, message)); }
    pending.clear();
  }
  function stop(why) {
    clearTimeout(idleTimer); idleTimer = null;
    const c = child; child = null; starting = null; buf = '';
    failAll('KEYSEND_FAILED', `Azy's key helper stopped (${why || 'stopped'}).`);
    if (c) { try { c.stdin.end(); } catch { /* gone */ } try { c.kill(); } catch { /* gone */ } }
  }
  function armIdle() { clearTimeout(idleTimer); idleTimer = setTimeout(() => { if (!pending.size) stop('idle'); }, idleMs); if (idleTimer.unref) idleTimer.unref(); }
  function onLine(line) {
    const m = /^(\d+) (OK|ERR)(?: (\d+))?(?: (.*))?$/.exec(line.trim());
    if (!m) return;
    const p = pending.get(Number(m[1]));
    if (!p) return;
    pending.delete(Number(m[1])); clearTimeout(p.timer);
    if (m[2] === 'OK') p.resolve();
    else if (m[3] === '6') p.reject(probeError('MODIFIERS_HELD', 'Let go of Ctrl, Shift and Alt, then apply again. Azy waits for them so Premiere never receives a different shortcut \u2014 nothing was sent and nothing changed.'));
    else if (m[3] === '7') p.reject(probeError('PREMIERE_MENU_OPEN', 'Premiere\u2019s menu bar is open, so Azy sent nothing. Close the menu (Esc) and apply again \u2014 nothing changed.'));
    else p.reject(probeError(m[3] === '3' ? 'PREMIERE_NOT_RUNNING' : 'KEYSEND_FAILED', `Azy could not send the detection keystroke to Premiere (${m[4] || 'error ' + m[3]}).`));
  }
  function start() {
    if (child && !starting) return Promise.resolve();
    if (starting) return starting;
    starting = new Promise((resolve, reject) => {
      let c, settled = false;
      const fail = (why) => { if (settled) return; settled = true; clearTimeout(t); stop(why); reject(probeError('HOST_START_FAILED', `key helper did not start (${why})`)); };
      try { c = spawnFn(spec.command, spec.args || [], { windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'] }); }
      catch (err) { settled = true; starting = null; reject(probeError('HOST_START_FAILED', `key helper did not start (${err.message})`)); return; }
      child = c;
      const t = setTimeout(() => fail('no READY in time'), readyMs);
      c.on('error', (err) => { if (!settled) fail(err.message); else if (child === c) stop(err.message); });
      c.on('exit', (code) => { if (!settled) fail('exited ' + code); else if (child === c) stop('exited ' + code); });
      c.stdout.setEncoding('utf8');
      c.stdout.on('data', (chunk) => {
        buf += chunk;
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i).replace(/\r$/, ''); buf = buf.slice(i + 1);
          if (!settled) {
            if (line.trim() === 'READY') { settled = true; clearTimeout(t); starting = null; armIdle(); resolve(); }
            else if (/^FAIL/.test(line)) fail(line.slice(5));
            continue;
          }
          onLine(line);
        }
      });
    });
    return starting;
  }
  async function send(action) {
    if (!Object.prototype.hasOwnProperty.call(KEY_ACTIONS, action)) throw probeError('KEYSEND_FAILED', 'unknown key action ' + action);
    await start(); // HOST_START_FAILED here = nothing was written
    const c = child;
    if (!c) throw probeError('HOST_START_FAILED', 'key helper went away before the key was sent');
    return new Promise((resolve, reject) => {
      const id = ++seq;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(probeError('KEYSEND_FAILED', 'Premiere did not confirm the detection keystroke in time.'));
        stop('timeout'); // a late key must never land after we gave up
      }, callMs);
      pending.set(id, { resolve, reject, timer });
      armIdle();
      try { c.stdin.write(`${id} ${action}\n`); }
      catch (err) { pending.delete(id); clearTimeout(timer); reject(probeError('KEYSEND_FAILED', err.message)); stop('write failed'); }
    });
  }
  return { send, warm: () => start().catch(() => {}), stop, get alive() { return !!child && !starting; } };
}

let winKeyHost = null;
let winKeyHostDisabled = false;
function windowsHostSpec() {
  const file = pathNode.join(osNode.tmpdir(), 'azy-keyhost-v1.ps1');
  try { if (!fsNode.existsSync(file) || fsNode.readFileSync(file, 'utf8') !== KEYHOST_PS) fsNode.writeFileSync(file, KEYHOST_PS); } catch { /* falls back below */ }
  return { command: 'powershell.exe', args: ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', file], idleMs: KEYHOST_IDLE_MS };
}
/** Windows: the warm key host; falls back to one PowerShell per key only if the host can't start. */
async function windowsSender(action) {
  if (!winKeyHostDisabled) {
    try {
      if (!winKeyHost) winKeyHost = createKeyHost(windowsHostSpec());
      return await winKeyHost.send(action);
    } catch (err) {
      if (!err || err.code !== 'HOST_START_FAILED') throw err; // the key may have been sent: never resend
      winKeyHostDisabled = true; // nothing was written — the one-shot path is safe for this session
      winKeyHost = null;
    }
  }
  return windowsSenderOnce(action);
}
/** Start the warm host early (e.g. when a Selected apply begins) — no-op off Windows / after a failure. */
function warmKeySender() {
  if (process.platform !== 'win32' || senderOverride || winKeyHostDisabled) return;
  try { if (!winKeyHost) winKeyHost = createKeyHost(windowsHostSpec()); winKeyHost.warm(); } catch { /* best effort */ }
}

function windowsSenderOnce(action) {
  // '+5' = Shift+5, Premiere's default "give Effect Controls the keyboard" shortcut.
  const key = action === 'focusEcp' ? '+5' : action === 'delete' ? '{DELETE}' : '^z';
  const ps = [
    "$ErrorActionPreference='Stop'",
    "$p=Get-Process | Where-Object { $_.ProcessName -like 'Adobe Premiere Pro*' -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1",
    'if(-not $p){ exit 3 }',
    // A global shortcut fires on key-DOWN: if Ctrl/Alt/Shift are still physically held, the
    // injected Delete would reach Premiere as Ctrl+Alt+Delete / Shift+Delete (ripple!) etc.
    // Wait (max ~1.5 s) until the user has let go of every modifier before sending anything.
    'Add-Type -AssemblyName System.Windows.Forms',
    "$n=0; while(([System.Windows.Forms.Control]::ModifierKeys -ne 'None') -and ($n -lt 60)){ Start-Sleep -Milliseconds 25; $n++ }",
    '$w=New-Object -ComObject WScript.Shell',
    'if(-not $w.AppActivate([int]$p.Id)){ exit 4 }',
    'Start-Sleep -Milliseconds 120',
    `$w.SendKeys('${key}')`,
    'Start-Sleep -Milliseconds 220'
  ].join('; ');
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', ps],
      { timeout: 15000, windowsHide: true }, (err, _out, errOut) => {
        if (err) {
          const code = /exit 3/.test(String(errOut) + String(err)) ? 'PREMIERE_NOT_RUNNING' : 'KEYSEND_FAILED';
          reject(probeError(code, `Azy could not send the detection keystroke to Premiere (${String(errOut || err.message).trim().split('\n')[0]}).`));
          return;
        }
        resolve();
      });
  });
}

function macSender(action) {
  const head = 'tell application "System Events" to set p to first process whose name starts with "Adobe Premiere Pro"\n'
    + 'tell application "System Events"\n  set frontmost of p to true\n  delay 0.15\n';
  // Shift+5 = Premiere's default Effect Controls focus shortcut; 117 = forward Delete
  // (51 is Backspace — never send that to a timeline).
  const body = action === 'focusEcp'
    ? head + '  keystroke "5" using {shift down}\nend tell'
    : action === 'delete'
      ? head + '  key code 117\nend tell'
      : head + '  keystroke "z" using command down\nend tell';
  return new Promise((resolve, reject) => {
    execFile('osascript', ['-e', body], { timeout: 15000 }, (err, _out, errOut) => {
      if (err) reject(probeError('KEYSEND_FAILED', `Azy could not send the detection keystroke to Premiere (${String(errOut || err.message).trim().split('\n')[0]}).`));
      else resolve();
    });
  });
}

function platformSender() {
  if (process.platform === 'win32') return windowsSender;
  if (process.platform === 'darwin') return macSender;
  return null;
}

let senderOverride = null;
/** Tests (and only tests) replace the OS keystroke sender with a scripted one. */
function setKeySender(fn) { senderOverride = fn; }
function getKeySender() { return senderOverride || platformSender(); }

/* ------------------------------------------------------------------ inventory helpers */

function paramId(p) { return `${p.clipRef}|${p.componentIndex}|${p.paramIndex}`; }

async function readInventory(server, withValues = true) {
  const res = await server.request('flowKeyframes', { scope: { range: 'all' }, withValues }, INVENTORY_TIMEOUT_MS);
  const params = (res && res.params) || [];
  const values = (res && res.values) || [];
  const map = new Map();
  for (let i = 0; i < params.length; i++) {
    const p = params[i];
    map.set(paramId(p), {
      clipRef: p.clipRef, clipName: p.clipName,
      component: p.componentIndex, componentName: p.componentName,
      param: p.paramIndex, paramName: p.paramName,
      ticks: (p.keyframes || []).map((k) => String(k.ticks)),
      values: withValues ? (values[i] || []) : []
    });
  }
  return map;
}

// Detection only needs the SET of ticks per parameter — never the values. Reading the
// inventory this way skips every getValueAtKey in the host, so the probe's re-reads
// (the Delete/Undo wait loop polls several times) cost a fraction of the old price.
// The single value snapshot captured up front is still available for the restore fallback.
function readTicks(server) { return readInventory(server, false); }

function signature(inv) {
  const parts = [];
  for (const [id, p] of inv) parts.push(`${id}:${p.ticks.join(',')}`);
  parts.sort();
  return parts.join('|');
}

/** Keys present in `before` but gone in `after`, with the values captured before the Delete. */
function diffInventories(before, after) {
  const out = [];
  for (const [id, b] of before) {
    const a = after.get(id);
    const stillThere = new Set(a ? a.ticks : []);
    const missingIdx = [];
    for (let i = 0; i < b.ticks.length; i++) if (!stillThere.has(b.ticks[i])) missingIdx.push(i);
    if (!missingIdx.length) continue;
    out.push({
      clipRef: b.clipRef, component: b.component, param: b.param,
      clipName: b.clipName, paramName: b.paramName,
      ticks: missingIdx.map((i) => b.ticks[i]),
      adds: missingIdx.map((i) => ({ ticks: b.ticks[i], value: b.values[i] }))
    });
  }
  return out;
}

// A read that FAILS after Delete is not "Premiere busy": the usual reason is that the selected
// clip itself is gone (Delete reached the timeline). The wait therefore stops at the first
// target-loss error and reports it, so the timeline guard runs at once instead of 3 s later.
// v1.20: Premiere usually reacts within tens of ms, so the first re-reads come quickly and back off
// to the steady cadence (never faster than ~35 ms, never more reads per second than before after
// the first ~200 ms). Same checks, same timeouts — only the waiting is shorter.
const FAST_POLLS = [35, 60, 100];
function pollDelay(i, pollMs) { return i < FAST_POLLS.length ? Math.min(FAST_POLLS[i], pollMs) : pollMs; }
async function waitForChange(server, baseline, timeoutMs, changed, pollMs = POLL_MS, read = readInventory) {
  const deadline = Date.now() + timeoutMs;
  const baseSig = signature(baseline);
  let inv = baseline;
  for (let i = 0; ; i++) {
    await sleep(pollDelay(i, pollMs));
    try { inv = await read(server); }
    catch (err) {
      if (err && (err.code === 'NO_TARGET_CLIP' || err.code === 'NO_ACTIVE_SEQUENCE')) { const lost = new Map(inv); lost.targetLost = true; return lost; } // never mutate the baseline
      if (Date.now() > deadline) return inv;
      continue; // Premiere genuinely busy mid-Delete — keep polling
    }
    if (changed(signature(inv), baseSig)) return inv;
    if (Date.now() > deadline) return inv;
  }
}

/* ------------------------------------------------------------------ timeline guard (v1.19) */

async function readTimeline(server) {
  try { return await server.request('timelineSignature', {}, INVENTORY_TIMEOUT_MS); }
  catch (err) {
    if (err && (err.code === 'UNSUPPORTED_COMMAND' || /does not implement|unknown op/i.test(String(err.message)))) {
      throw probeError('CONNECTOR_UPDATE_NEEDED', 'Selected keyframe detection now checks the timeline before and after every keystroke. Restart Premiere Pro once so Azy can update its extension, then apply again (Clip and Playhead work meanwhile).');
    }
    throw err;
  }
}

/** Same params with the same names — a deleted EFFECT shifts component indices; keys never do. */
function structureShifted(before, after) {
  for (const [id, a] of after) {
    const b = before.get(id);
    if (!b || b.componentName !== a.componentName || b.paramName !== a.paramName) return true;
  }
  return false;
}


/* ------------------------------------------------------------------ the probe */

/**
 * Run the Delete/Ctrl+Z detection. Resolves with
 *   { keys: [{clipRef, component, param, ticks[]}], detected: [...with adds...], warnings: [] }
 * or rejects with a coded, user-readable error. Never sends Ctrl+Z unless Delete
 * demonstrably removed keyframes, so the user's own undo history is never consumed.
 */
async function run(opts) {
  const server = opts.server;
  // An explicit null means "no sender available" (tests); otherwise fall back to the platform one.
  const sendKeys = 'sendKeys' in opts ? opts.sendKeys : getKeySender();
  const log = opts.log || (() => {});
  if (!server) throw probeError('SELECTED_UNSUPPORTED', 'Selected detection needs the Premiere connection.');
  if (typeof sendKeys !== 'function') {
    throw probeError('SELECTED_UNSUPPORTED', 'Selected keyframe detection is not available on this platform yet. Use Clip or Playhead.');
  }

  // Start the Effect Controls focus keystroke first: it takes two OS round-trips with its own
  // settle sleeps, and it is independent of the keyframe inventory, so the (expensive) baseline
  // read happens while Premiere is being brought to the keyboard front. The baseline must
  // simply be captured before Delete lands — it always is, since Delete is sent only after both
  // the focus promise and this read resolve.
  let focusedAt = 0, focusRefused = null;
  const focusP = (async () => {
    try { await sendKeys('focusEcp'); }
    catch (err) {
      log('warn', `probe: Effect Controls focus keystroke failed: ${err.message}`);
      // v1.22: refused BEFORE any key was sent — stop here rather than follow with a Delete.
      if (err && (err.code === 'MODIFIERS_HELD' || err.code === 'PREMIERE_MENU_OPEN')) focusRefused = err;
    }
    focusedAt = Date.now();
  })();
  // v1.20: both baselines are read at once (they're independent and both finish before the Delete).
  const timelineP = readTimeline(server);
  timelineP.catch(() => {}); // awaited below; never an unhandled rejection if the inventory fails first
  let before;
  try { before = await readInventory(server); }
  catch (err) {
    if (err && err.code === 'NO_TARGET_CLIP') throw probeError('NO_TARGET_CLIP', 'Select the clip whose highlighted keyframes you want to ease, then apply again.');
    throw err;
  }
  if (!before.size) {
    throw probeError('NO_KEYFRAMES', 'No keyframes on the selected clip(s). Add keyframes in Effect Controls, highlight the ones you want, then apply.');
  }

  // Timeline guard baseline: what a stray Delete could remove (clips on every track + project items).
  const timeline0 = await timelineP;
  const pollMs = envInt('AZY_PROBE_POLL_MS', POLL_MS);
  const deleteTimeoutMs = envInt('AZY_PROBE_DELETE_MS', DELETE_TIMEOUT_MS);
  const undoTimeoutMs = envInt('AZY_PROBE_UNDO_MS', UNDO_TIMEOUT_MS);
  const focusSettleMs = envInt('AZY_PROBE_FOCUS_MS', FOCUS_SETTLE_MS);
  const beforeSig = signature(before);
  log('info', `probe: inventory ${before.size} param(s), ${[...before.values()].reduce((n, p) => n + p.ticks.length, 0)} keyframe(s)`);
  // Give Effect Controls the keyboard first: the highlight lives there, but the user's
  // last click inside Premiere was probably the timeline, where Delete is a no-op.
  // Shift+5 is Premiere's own default shortcut for focusing the panel.
  await focusP;
  if (focusRefused) throw focusRefused;
  // The settle time counts from when the focus key landed — the baseline reads above overlap it.
  const settleLeft = focusSettleMs - (Date.now() - focusedAt);
  if (settleLeft > 0) await sleep(settleLeft);
  // After EVERY Delete: did it touch anything but keyframes? If so it reached the timeline or the
  // Project panel (Effect Controls did not have the keyboard). Undo it immediately — Delete
  // demonstrably acted, so this Ctrl+Z is ours — verify the timeline is back, and refuse.
  // Flow never guesses after a stray Delete and never sends a second one.
  const guard = async () => {
    const now = await readTimeline(server);
    if (now.hash === timeline0.hash) return;
    log('warn', `probe: Delete changed the timeline/project (${timeline0.clips}→${now.clips} clips, ${timeline0.projectItems}→${now.projectItems} items) — undoing`);
    await sendKeys('undo');
    const deadline = Date.now() + undoTimeoutMs;
    let back = false;
    for (let i = 0; Date.now() < deadline; i++) {
      await sleep(pollDelay(i, pollMs));
      try { if ((await readTimeline(server)).hash === timeline0.hash) { back = true; break; } } catch { /* busy */ }
    }
    if (back) throw probeError('DELETE_HIT_TIMELINE', 'Effect Controls didn\u2019t have the keyboard, so the detection Delete reached the timeline. Azy undid it at once \u2014 nothing was lost and no easing was applied. Click a highlighted keyframe inside Effect Controls, then apply again.');
    throw probeError('DELETE_HIT_TIMELINE', 'Effect Controls didn\u2019t have the keyboard, so the detection Delete reached the timeline and Azy could not confirm the undo. Press Ctrl+Z in Premiere now to bring the clip back. No easing was applied.');
  };

  // A failed Delete SEND is ambiguous (the key may still have landed). Look before reporting:
  // if the timeline or the keyframes changed, undo it and stop; never ease after an unclear send.
  const sendDelete = async () => {
    try { await sendKeys('delete'); }
    catch (err) {
      await sleep(pollMs * 2);
      let tl = null, ticks = null;
      try { tl = await readTimeline(server); } catch { /* unreadable */ }
      try { ticks = await readTicks(server); } catch { /* unreadable */ }
      const landed = (tl && tl.hash !== timeline0.hash) || (ticks && signature(ticks) !== beforeSig);
      if (landed) {
        let undone = false;
        try { await sendKeys('undo'); undone = true; } catch { /* reported below */ }
        throw probeError(err.code || 'KEYSEND_FAILED', `${err.message} The Delete still reached Premiere, so Azy ${undone ? 'sent Ctrl+Z to restore it' : 'could not undo it \u2014 press Ctrl+Z in Premiere now'}. Nothing was eased; check the timeline and Effect Controls.`);
      }
      throw err;
    }
  };

  await sendDelete();
  // Poll the ticks-only inventory (no values) — the probe only ever compares keyframe times.
  let afterDelete = await waitForChange(server, before, deleteTimeoutMs, (now, base) => now !== base, pollMs, readTicks);
  await guard();

  if (signature(afterDelete) === beforeSig && !afterDelete.targetLost) {
    // Shift+5 may be remapped (or something else ate the key) — one plain Delete retry. Safe now:
    // the guard just proved the timeline is untouched, and it runs again after this Delete.
    log('info', 'probe: focused Delete changed nothing — retrying with a plain Delete');
    await sendDelete();
    afterDelete = await waitForChange(server, before, deleteTimeoutMs, (now, base) => now !== base, pollMs, readTicks);
    await guard();
  }

  if (afterDelete.targetLost || structureShifted(before, afterDelete)) {
    // The clip vanished from the selection, or an EFFECT (not keyframes) was deleted — component
    // indices shifted, so a key diff would point at the wrong parameters. Undo and refuse.
    await sendKeys('undo');
    await waitForChange(server, afterDelete, undoTimeoutMs, (now) => now === beforeSig, pollMs, readTicks);
    throw probeError('SELECTED_NOT_DETECTED', 'An effect (not keyframes) was selected in Effect Controls, so Azy undid the detection Delete and applied nothing. Click the keyframes themselves so they turn blue, then apply again.');
  }

  if (signature(afterDelete) === beforeSig) {
    // Nothing was highlighted (or Effect Controls could not be focused). Ctrl+Z is NOT sent:
    // it would undo the user's own last action instead.
    log('info', 'probe: Delete changed nothing — no highlighted keyframes detected');
    throw probeError('SELECTED_NOT_DETECTED', 'Azy didn\u2019t detect any highlighted keyframes: it focused Effect Controls (Shift+5) and pressed Delete, but no keyframe was removed. In Premiere, click the keyframes you want so they turn blue, keep Premiere in front, then apply again. If you remapped the Effect Controls panel shortcut, click inside Effect Controls right before applying.');
  }

  const detected = diffInventories(before, afterDelete);
  if (!detected.length) {
    // Inventory changed but no keys went missing (e.g. Premiere was mid-edit) — undo what we saw and stop.
    await sendKeys('undo');
    await guard().catch(() => {});
    throw probeError('SELECTED_NOT_DETECTED', 'Azy couldn\u2019t identify the highlighted keyframes. Highlight them again in Effect Controls and apply once more.');
  }
  log('info', `probe: Delete removed ${detected.reduce((n, d) => n + d.ticks.length, 0)} highlighted keyframe(s) on ${detected.length} param(s)`);

  // Restore: Premiere's own Ctrl+Z brings the keys back exactly as they were.
  await sendKeys('undo');
  const afterUndo = await waitForChange(server, afterDelete, undoTimeoutMs, (now) => now === beforeSig, pollMs, readTicks);
  // The undo must not have reached further back than our Delete either.
  const timeline2 = await readTimeline(server);
  if (timeline2.hash !== timeline0.hash) {
    throw probeError('DELETE_HIT_TIMELINE', 'The timeline changed while Azy restored the detection keys \u2014 nothing was eased. Check the timeline and press Ctrl+Z / Ctrl+Shift+Z in Premiere if a change is unexpected.');
  }

  const warnings = [];
  let missing = diffInventories(before, afterUndo);
  if (missing.length) {
    // Ctrl+Z did not restore everything (Premiere was busy, or the undo was merged) — rebuild
    // the missing keys from the values captured before the Delete.
    log('warn', `probe: ${missing.reduce((n, m) => n + m.ticks.length, 0)} keyframe(s) missing after undo — re-adding from captured values`);
    try {
      await server.request('restoreKeys', { keys: missing.map((m) => ({ ref: m.clipRef, component: m.component, param: m.param, adds: m.adds })) }, INVENTORY_TIMEOUT_MS);
      const recheck = await readTicks(server);
      missing = diffInventories(before, recheck);
    } catch (err) {
      log('warn', `probe: restoreKeys failed: ${err && err.message}`);
    }
    if (missing.length) {
      warnings.push(`${missing.reduce((n, m) => n + m.ticks.length, 0)} keyframe(s) could not be restored automatically — press Ctrl+Z in Premiere or re-add them manually.`);
    } else {
      warnings.push('The detection keys were restored by Azy (values kept, interpolation reset) — check them once.');
    }
  }

  return {
    keys: detected.map((d) => ({ clipRef: d.clipRef, component: d.component, param: d.param, ticks: d.ticks })),
    detected,
    warnings
  };
}

module.exports = {
  run,
  setKeySender,
  getKeySender,
  createKeyHost,
  KEYHOST_IDLE_MS,
  NATIVE_KEYS_CS,
  warmKeySender,
  KEY_ACTIONS,
  KEYHOST_PS,
  readInventory,
  readTicks,
  readTimeline,
  structureShifted,
  signature,
  diffInventories,
  paramId,
  probeError,
  platformSender,
  POLL_MS,
  FAST_POLLS,
  DELETE_TIMEOUT_MS,
  UNDO_TIMEOUT_MS
};
