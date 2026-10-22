/*
 * Azy Dagger native input companion (Windows x64)
 *
 * Why this exists:
 * A low-level Windows mouse hook must return before Windows posts the mouse
 * message to Premiere. JavaScript FFI callbacks are asynchronous at that
 * boundary, so they can observe a click but cannot reliably consume it.
 * This tiny helper owns the Win32 hook/message pump, consumes the initiating
 * click synchronously, and performs cursor operations using direct Win32 APIs.
 *
 * It is deliberately narrow:
 *   - inherited stdin/stdout only (no socket, no network, no persisted input),
 *   - parent-PID watchdog restores the system cursor if Azy exits unexpectedly,
 *   - commands are tab-delimited private pipe messages from its parent,
 *   - it never reads files, executes presets, or talks to Premiere.
 *
 * Protocol, Node -> helper
 *   C <enabled> <wheel> <mods> <button> <mode> <vk> ...   configure bindings (mode 0 hold / 1 toggle; vk>0 = keyboard key)
 *   V <wheel>                                  preview a wheel
 *   K [session]                                close/cancel one session (0 = current)
 *   R [session]                                restore one closed cursor session
 *   Q                                          restore cursor and quit
 *
 * Protocol, helper -> Node
 *   R <ok> <win32-error>                       ready / hook result
 *   S <part> <ok> <win32-error>                operation status
 *   O <wheel> <physical-x> <physical-y> <id>   wheel opened
 *   M <physical-x> <physical-y> <id>           physical pointer move
 *   X <commit> <id>                            wheel gesture ended
 *
 * Every input transaction has a non-zero monotonic id. Node scopes K/R to that id,
 * so queued pipe messages from an older close cannot affect a newly opened wheel.
 *
 * Build (from the Azy root):
 *   x86_64-w64-mingw32-gcc -std=c11 -Os -s -static -mwindows \
 *     presets/native/dagger-native.c -o assets/dagger-native.exe -luser32 -lshell32 -lshcore \
 *     -Wl,--no-insert-timestamp
 */

#define WIN32_LEAN_AND_MEAN
#define _WIN32_WINNT 0x0601
#include <windows.h>
#include <shellapi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <stdint.h>

#define APP_EVENT_OPEN        (WM_APP + 41)
#define APP_EVENT_MOVE        (WM_APP + 42)
#define APP_EVENT_CLOSE       (WM_APP + 43)
#define APP_EVENT_ARM_RESTORE (WM_APP + 44)
#define APP_EVENT_RESTORE     (WM_APP + 45)
#define APP_EVENT_QUIT        (WM_APP + 46)
#define APP_EVENT_PREVIEW     (WM_APP + 47)
#define APP_EVENT_STATUS      (WM_APP + 48)
#define APP_EVENT_CANCEL       (WM_APP + 49)
#define TIMER_RESTORE          91
#define RESTORE_FALLBACK_MS    1200
#define MOVE_MIN_INTERVAL_MS   8

/* These match dagger-main.js. */
enum WheelId { WHEEL_MAIN = 0, WHEEL_SFX = 1, WHEEL_PRESETS = 2, WHEEL_FLOW = 3, WHEEL_COUNT = 4 };
enum StatusPart { STATUS_WARP = 0, STATUS_HIDE = 1, STATUS_CONFINE = 2, STATUS_GUARD = 3, STATUS_COUNT = 4 };

#define AZY_MOD_CTRL  1u
#define AZY_MOD_ALT   2u
#define AZY_MOD_SHIFT 4u

typedef struct Binding {
  BOOL enabled;
  unsigned mods;
  int button;   /* 1 = left, 2 = right, 3 = middle, 4/5 = side buttons; 0 when the binding is a keyboard key */
  DWORD vk;     /* non-zero: the wheel is opened by this keyboard key instead of a mouse button */
  int toggle;   /* 0 = hold (release commits), 1 = toggle (press opens, click/Enter commits, press again/Esc cancels) */
} Binding;

typedef HANDLE (WINAPI *SetThreadDpiAwarenessContextFn)(HANDLE);
typedef BOOL (WINAPI *SetProcessDpiAwarenessContextFn)(HANDLE);
typedef HRESULT (WINAPI *GetDpiForMonitorFn)(HMONITOR, int, UINT *, UINT *);

static const char *WHEEL_NAMES[WHEEL_COUNT] = { "main", "sfx", "presets", "flow" };
static const char *STATUS_NAMES[STATUS_COUNT] = { "warp", "hide", "confine", "clickGuard" };
static const UINT CURSOR_IDS[] = {
  32512, /* OCR_NORMAL */
  32513, /* OCR_IBEAM */
  32514, /* OCR_WAIT */
  32515, /* OCR_CROSS */
  32516, /* OCR_UP */
  32642, /* OCR_SIZENWSE */
  32643, /* OCR_SIZENESW */
  32644, /* OCR_SIZEWE */
  32645, /* OCR_SIZENS */
  32646, /* OCR_SIZEALL */
  32648, /* OCR_NO */
  32649, /* OCR_HAND */
  32650, /* OCR_APPSTARTING */
  32651  /* OCR_HELP */
};

static CRITICAL_SECTION g_lock;
static CRITICAL_SECTION g_out_lock;
static HANDLE g_stdin_handle = INVALID_HANDLE_VALUE;
static HANDLE g_stdout_handle = INVALID_HANDLE_VALUE;
static DWORD g_main_thread = 0;
static volatile LONG g_quitting = 0;
static volatile LONG g_move_pending = 0;
static HHOOK g_mouse_hook = NULL;
static HHOOK g_key_hook = NULL;
static Binding g_bindings[WHEEL_COUNT];
static BOOL g_enabled = FALSE;

static BOOL g_active = FALSE;
static int g_active_wheel = -1;
static int g_active_button = 0;
static unsigned g_active_mods = 0;
static DWORD g_active_key = 0;
static int g_active_toggle = 0;
/* One monotonic id per physical/preview transaction. Session 0 is reserved for
   an unscoped backwards-compatible K/R request. */
static DWORD g_session_id = 0;
static DWORD g_active_session = 0;
static DWORD g_cursor_session = 0;
static DWORD g_restore_timer_session = 0;
/* Every DOWN we swallow must retain a matching UP even if a close/reopen happens
   before it arrives. These are deliberately separate from g_active: clearing the
   wheel state must never leak a lone UP into Premiere or Windows. */
static unsigned g_suppressed_button_ups = 0;
static DWORD g_suppressed_button_sessions[6] = { 0 };
static BYTE g_suppressed_key_ups[256] = { 0 };
static DWORD g_suppressed_key_sessions[256] = { 0 };
static POINT g_open_point = { 0, 0 };
static POINT g_move_point = { 0, 0 };
/* The point before the one deliberate centre warp. Restoring here means a completed
   Dagger gesture never leaves the user's real desktop pointer pinned at the hub. */
static POINT g_restore_point = { 0, 0 };
static BOOL g_restore_point_valid = FALSE;
static DWORD g_last_move_tick = 0;

static BOOL g_system_cursors_changed = FALSE;
static GetDpiForMonitorFn g_get_dpi_for_monitor = NULL;

static int wheel_from_name(const char *name) {
  int i;
  if (!name) return -1;
  for (i = 0; i < WHEEL_COUNT; i++) if (strcmp(name, WHEEL_NAMES[i]) == 0) return i;
  return -1;
}

static unsigned mods_from_name(const char *name) {
  unsigned out = 0;
  if (!name) return 0;
  if (strstr(name, "ctrl") != NULL) out |= AZY_MOD_CTRL;
  if (strstr(name, "alt") != NULL) out |= AZY_MOD_ALT;
  if (strstr(name, "shift") != NULL) out |= AZY_MOD_SHIFT;
  return out;
}

static unsigned held_mods(void) {
  unsigned out = 0;
  if (GetAsyncKeyState(VK_CONTROL) & 0x8000) out |= AZY_MOD_CTRL;
  if (GetAsyncKeyState(VK_MENU) & 0x8000) out |= AZY_MOD_ALT;
  if (GetAsyncKeyState(VK_SHIFT) & 0x8000) out |= AZY_MOD_SHIFT;
  return out;
}

/* stdout is an inherited private pipe. It is never used for logs. */
static void emit_line(const char *fmt, ...) {
  char line[256];
  va_list args;
  DWORD written = 0;
  int n;
  if (g_stdout_handle == INVALID_HANDLE_VALUE || !g_stdout_handle) return;
  va_start(args, fmt);
  n = vsnprintf(line, sizeof(line) - 2, fmt, args);
  va_end(args);
  if (n < 0) return;
  if (n > (int)sizeof(line) - 2) n = (int)sizeof(line) - 2;
  line[n++] = '\n';
  line[n] = '\0';
  EnterCriticalSection(&g_out_lock);
  /* A closed parent pipe can only make the helper quieter; it must never crash the hook. */
  WriteFile(g_stdout_handle, line, (DWORD)n, &written, NULL);
  LeaveCriticalSection(&g_out_lock);
}

/* Windows guarantees FARPROC and a function pointer are pointer-sized on the supported x64
   build. memcpy avoids a compiler-specific FARPROC function-signature cast warning. */
#define LOAD_PROC(dst, module, name) do { \
  FARPROC raw_proc__ = (module) ? GetProcAddress((module), (name)) : NULL; \
  memset(&(dst), 0, sizeof(dst)); \
  if (raw_proc__) memcpy(&(dst), &raw_proc__, sizeof(dst)); \
} while (0)

static void set_dpi_awareness(void) {
  HMODULE user = GetModuleHandleW(L"user32.dll");
  SetProcessDpiAwarenessContextFn set_process_ctx = NULL;
  SetThreadDpiAwarenessContextFn set_thread_ctx = NULL;
  /* Make the process itself per-monitor-v2 before either hook thread exists. A thread-only
     setting can be inherited inconsistently by the pipe/watch threads on mixed-DPI desktops. */
  LOAD_PROC(set_process_ctx, user, "SetProcessDpiAwarenessContext");
  LOAD_PROC(set_thread_ctx, user, "SetThreadDpiAwarenessContext");
  /* PER_MONITOR_AWARE_V2 is the documented negative handle -4. */
  if (set_process_ctx && set_process_ctx((HANDLE)(INT_PTR)-4)) return;
  if (set_thread_ctx) {
    set_thread_ctx((HANDLE)(INT_PTR)-4);
  } else {
    /* Windows 7 / older Windows 10 fallback. */
    SetProcessDPIAware();
  }
}

static void init_cursor_functions(void) {
  HMODULE shcore = LoadLibraryW(L"Shcore.dll");
  LOAD_PROC(g_get_dpi_for_monitor, shcore, "GetDpiForMonitor");
}

/* This helper is per-monitor-v2 aware before its hook is installed, so the standard
   Win32 cursor APIs already use the same physical screen coordinates as WH_MOUSE_LL.
   This deliberately follows the proven v29 path: one normal SetCursorPos transaction,
   rather than mixing physical and DPI-virtualized cursor APIs across two processes. */
static BOOL get_cursor_point(POINT *pt) {
  return GetCursorPos(pt);
}

static BOOL set_cursor_point(const POINT *pt) {
  return SetCursorPos(pt->x, pt->y);
}

static UINT dpi_for_monitor(HMONITOR mon) {
  UINT x = 96, y = 96;
  if (g_get_dpi_for_monitor && SUCCEEDED(g_get_dpi_for_monitor(mon, 0 /* MDT_EFFECTIVE_DPI */, &x, &y)) && x) return x;
  {
    HDC dc = GetDC(NULL);
    if (dc) {
      int dpi = GetDeviceCaps(dc, LOGPIXELSX);
      ReleaseDC(NULL, dc);
      if (dpi > 0) return (UINT)dpi;
    }
  }
  return 96;
}

/* Both modes hide the real pointer: the wheel draws its own white dot (dagger-renderer.js) in its place. */
static BOOL hide_system_cursor(void) {
  BYTE and_mask[128];
  BYTE xor_mask[128];
  HCURSOR blank;
  size_t i;
  BOOL every = TRUE;
  BOOL any = FALSE;
  memset(and_mask, 0xff, sizeof(and_mask));
  memset(xor_mask, 0x00, sizeof(xor_mask));
  blank = CreateCursor(NULL, 0, 0, 32, 32, and_mask, xor_mask);
  if (!blank) return FALSE;
  for (i = 0; i < sizeof(CURSOR_IDS) / sizeof(CURSOR_IDS[0]); i++) {
    HCURSOR copy = CopyCursor(blank);
    if (!copy || !SetSystemCursor(copy, CURSOR_IDS[i])) {
      every = FALSE;
      if (copy) DestroyCursor(copy);
    } else {
      any = TRUE;
    }
  }
  DestroyCursor(blank);
  if (any) g_system_cursors_changed = TRUE;

  /* SetSystemCursor changes every system cursor shape. Do not also manipulate
     ShowCursor's per-thread counter: the pointer is normally over Premiere's thread,
     and that extra counter dance was a source of visible hide/show glitches. */
  return every;
}

static void restore_cursor(void) {
  /* Unclip and restore the location while the cursor is still blank. This prevents a
     visible jump from the hub and, critically, makes every completion/cancellation put
     the real pointer back where the gesture began. */
  ClipCursor(NULL);
  if (g_restore_point_valid) {
    (void)set_cursor_point(&g_restore_point);
    g_restore_point_valid = FALSE;
  }
  if (g_system_cursors_changed) {
    SystemParametersInfoW(SPI_SETCURSORS, 0, NULL, 0);
    g_system_cursors_changed = FALSE;
  }
}

/* Node's delayed R is session-scoped. A close animation from session N must not
   restore the system cursor over a reopened session N+1. Session 0 remains the
   safe compatibility form and only acts when no wheel is active. */
static void restore_cursor_for_session(DWORD session) {
  if (g_active || !g_cursor_session) return;
  if (session && session != g_cursor_session) return;
  restore_cursor();
  g_cursor_session = 0;
  g_restore_timer_session = 0;
}

static void report_status(int part, BOOL ok, DWORD err) {
  if (part < 0 || part >= STATUS_COUNT) return;
  /* Posting keeps the low-level hook callback free of pipe I/O. */
  PostThreadMessage(g_main_thread, APP_EVENT_STATUS, (WPARAM)part, (LPARAM)((ok ? 1 : 0) | ((uintptr_t)err << 1)));
}

static int button_for_mouse_message(WPARAM message, const MSLLHOOKSTRUCT *st) {
  switch ((UINT)message) {
    case WM_LBUTTONDOWN: case WM_LBUTTONUP: return 1;
    case WM_RBUTTONDOWN: case WM_RBUTTONUP: return 2;
    case WM_MBUTTONDOWN: case WM_MBUTTONUP: return 3;
    case WM_XBUTTONDOWN: case WM_XBUTTONUP:
      return ((HIWORD(st->mouseData) == XBUTTON2) ? 5 : 4);
    default: return 0;
  }
}

static BOOL is_down_message(WPARAM message) {
  return message == WM_LBUTTONDOWN || message == WM_RBUTTONDOWN || message == WM_MBUTTONDOWN || message == WM_XBUTTONDOWN;
}

static BOOL is_up_message(WPARAM message) {
  return message == WM_LBUTTONUP || message == WM_RBUTTONUP || message == WM_MBUTTONUP || message == WM_XBUTTONUP;
}

static DWORD next_session_id(DWORD id) {
  id++;
  return id ? id : 1;
}

static UINT button_mask(int button) {
  return (button >= 1 && button <= 5) ? (1u << (unsigned)(button - 1)) : 0;
}

static int vk_for_button(int button) {
  switch (button) {
    case 1: return VK_LBUTTON;
    case 2: return VK_RBUTTON;
    case 3: return VK_MBUTTON;
    case 4: return VK_XBUTTON1;
    case 5: return VK_XBUTTON2;
    default: return 0;
  }
}

/* Pairing belongs to the hook-owner thread. We deliberately retain it after a
   gesture closes, because Windows can deliver the physical UP after Escape, a
   modifier release, cancel, or a very fast next session. */
static void remember_suppressed_button(int button) {
  UINT mask = button_mask(button);
  if (!mask) return;
  g_suppressed_button_ups |= mask;
  g_suppressed_button_sessions[button] = g_active ? g_active_session : next_session_id(g_session_id);
}

static DWORD take_suppressed_button(int button) {
  UINT mask = button_mask(button);
  DWORD session;
  if (!mask || !(g_suppressed_button_ups & mask)) return 0;
  g_suppressed_button_ups &= ~mask;
  session = g_suppressed_button_sessions[button];
  g_suppressed_button_sessions[button] = 0;
  return session;
}

static void remember_suppressed_key(DWORD vk) {
  if (vk > 255) return;
  g_suppressed_key_ups[vk] = 1;
  g_suppressed_key_sessions[vk] = g_active ? g_active_session : g_session_id;
}

static DWORD take_suppressed_key(DWORD vk) {
  DWORD session;
  if (vk > 255 || !g_suppressed_key_ups[vk]) return 0;
  g_suppressed_key_ups[vk] = 0;
  session = g_suppressed_key_sessions[vk];
  g_suppressed_key_sessions[vk] = 0;
  return session;
}

/* Do not carry a missed UP into a future gesture. A key/button that is still
   physically down remains paired until its actual UP, avoiding a lone release. */
static void prune_stale_suppression(void) {
  int button;
  int vk;
  for (button = 1; button <= 5; button++) {
    UINT mask = button_mask(button);
    int button_vk = vk_for_button(button);
    if ((g_suppressed_button_ups & mask) && (!button_vk || !(GetAsyncKeyState(button_vk) & 0x8000))) {
      g_suppressed_button_ups &= ~mask;
      g_suppressed_button_sessions[button] = 0;
    }
  }
  for (vk = 0; vk < 256; vk++) {
    if (g_suppressed_key_ups[vk] && !(GetAsyncKeyState(vk) & 0x8000)) {
      g_suppressed_key_ups[vk] = 0;
      g_suppressed_key_sessions[vk] = 0;
    }
  }
}

static int matching_wheel(unsigned mods, int button) {
  int found = -1;
  int i;
  EnterCriticalSection(&g_lock);
  if (g_enabled) {
    for (i = 0; i < WHEEL_COUNT; i++) {
      if (g_bindings[i].enabled && !g_bindings[i].vk && g_bindings[i].button == button && g_bindings[i].mods == mods) {
        found = i;
        break;
      }
    }
  }
  LeaveCriticalSection(&g_lock);
  return found;
}

static int matching_key_wheel(unsigned mods, DWORD vk) {
  int found = -1;
  int i;
  EnterCriticalSection(&g_lock);
  if (g_enabled) {
    for (i = 0; i < WHEEL_COUNT; i++) {
      if (g_bindings[i].enabled && g_bindings[i].vk && g_bindings[i].vk == vk && g_bindings[i].mods == mods) {
        found = i;
        break;
      }
    }
  }
  LeaveCriticalSection(&g_lock);
  return found;
}

static void close_active(BOOL commit) {
  DWORD session;
  if (!g_active) return;
  session = g_active_session;
  g_active = FALSE;
  g_active_wheel = -1;
  g_active_button = 0;
  g_active_mods = 0;
  g_active_key = 0;
  g_active_toggle = 0;
  g_active_session = 0;
  InterlockedExchange(&g_move_pending, 0);
  /* All cursor work is deferred to the hook-owner message loop. The hook only
     closes its transient input state and posts an ordered, session-scoped event. */
  PostThreadMessage(g_main_thread, APP_EVENT_CLOSE, (WPARAM)(commit ? 1 : 0), (LPARAM)session);
  PostThreadMessage(g_main_thread, APP_EVENT_ARM_RESTORE, (WPARAM)session, 0);
}

/* The hook only marks the gesture active and queues this message. Moving/hiding a system
   cursor, replacing cursor resources, or clipping an input region in WH_MOUSE_LL can exceed the
   low-level hook timeout. Do it from the owner message loop after the hook has returned 1. */
static void activate_active_wheel(int wheel, DWORD session) {
  HMONITOR mon;
  MONITORINFO mi;
  POINT center;
  UINT dpi;
  LONG radius;
  RECT clip;
  BOOL warp_ok;
  BOOL hide_ok;
  BOOL clip_ok;
  if (!g_active || wheel != g_active_wheel || session != g_active_session) return;

  mon = MonitorFromPoint(g_open_point, MONITOR_DEFAULTTONEAREST);
  memset(&mi, 0, sizeof(mi));
  mi.cbSize = sizeof(mi);
  if (!GetMonitorInfoW(mon, &mi)) {
    mi.rcMonitor.left = 0; mi.rcMonitor.top = 0;
    mi.rcMonitor.right = GetSystemMetrics(SM_CXSCREEN);
    mi.rcMonitor.bottom = GetSystemMetrics(SM_CYSCREEN);
  }
  center.x = mi.rcMonitor.left + (mi.rcMonitor.right - mi.rcMonitor.left) / 2;
  center.y = mi.rcMonitor.top + (mi.rcMonitor.bottom - mi.rcMonitor.top) / 2;
  g_open_point = center;
  g_move_point = center;
  g_cursor_session = session;

  /* v29's proven order is important: change all system cursor shapes first, then
     make the one centre warp while it is blank, then confine it. A visible arrow
     never travels from the source app into the hub, and there is only one warp. */
  hide_ok = hide_system_cursor();
  report_status(STATUS_HIDE, hide_ok, hide_ok ? 0 : GetLastError());

  warp_ok = set_cursor_point(&center);
  report_status(STATUS_WARP, warp_ok, warp_ok ? 0 : GetLastError());

  dpi = dpi_for_monitor(mon);
  radius = (LONG)((228.0 * (double)dpi / 96.0) + 0.5); /* wheel window half-size 230 css px: reaches the pinned bubbles at ~204 px */
  clip.left = center.x - radius;
  clip.top = center.y - radius;
  clip.right = center.x + radius;
  clip.bottom = center.y + radius;
  clip_ok = ClipCursor(&clip);
  report_status(STATUS_CONFINE, clip_ok, clip_ok ? 0 : GetLastError());
}

static void begin_wheel(int wheel, POINT origin, BOOL swallow_button) {
  Binding binding;
  /* Physical input calls prune before it records the initiating DOWN, so this
     check can never discard that just-swallowed half of a pair. */
  if (!swallow_button) prune_stale_suppression();
  if (wheel < 0 || wheel >= WHEEL_COUNT || g_active) {
    if (swallow_button) (void)take_suppressed_button(g_active_button);
    return;
  }
  EnterCriticalSection(&g_lock);
  binding = g_bindings[wheel];
  LeaveCriticalSection(&g_lock);
  /* Preview is allowed to show a configured wheel even if Dagger is toggled off; a real input
     gesture may never enter here without an enabled binding. */
  if (swallow_button && !binding.enabled) {
    if (binding.vk) (void)take_suppressed_key(binding.vk); else (void)take_suppressed_button(binding.button);
    return;
  }
  if (!binding.enabled) { binding.button = 2; binding.mods = 0; }

  KillTimer(NULL, TIMER_RESTORE);
  g_restore_timer_session = 0;
  g_session_id = next_session_id(g_session_id);
  g_active_session = g_session_id;
  g_active = TRUE;
  g_active_wheel = wheel;
  g_active_button = binding.vk ? 0 : binding.button;
  g_active_key = binding.vk;
  g_active_toggle = binding.enabled ? binding.toggle : 0;
  g_active_mods = binding.mods;
  InterlockedExchange(&g_move_pending, 0);
  /* Keep the original physical point for two separate jobs: choose its monitor in the
     owner loop, and return the real pointer there after this temporary radial gesture. */
  g_restore_point = origin;
  g_restore_point_valid = TRUE;
  g_open_point = origin;
  g_move_point = origin;
  PostThreadMessage(g_main_thread, APP_EVENT_OPEN, (WPARAM)wheel, (LPARAM)g_active_session);
}

static LRESULT CALLBACK low_level_mouse_proc(int code, WPARAM w_param, LPARAM l_param) {
  const MSLLHOOKSTRUCT *st = (const MSLLHOOKSTRUCT *)l_param;
  int button;
  if (code < HC_ACTION || !st) return CallNextHookEx(g_mouse_hook, code, w_param, l_param);
  button = button_for_mouse_message(w_param, st);

  if (is_down_message(w_param)) {
    int wheel = matching_wheel(held_mods(), button);
    if (!g_active && wheel >= 0) {
      /* Return before any cursor operation. The target app never receives the configured
         initiating DOWN, so Premiere/Discord/Explorer cannot start a context-menu gesture. */
      prune_stale_suppression();
      remember_suppressed_button(button);
      begin_wheel(wheel, st->pt, TRUE);
      return 1;
    }
  }

  if (is_up_message(w_param) && button) {
    DWORD suppressed_session = take_suppressed_button(button);
    if (suppressed_session) {
      /* Only the exact transaction that consumed the DOWN may commit. An old
         delayed UP is still paired/consumed, but cannot collapse a newer session. */
      if (g_active && !g_active_toggle && button == g_active_button && suppressed_session == g_active_session) close_active(TRUE);
      return 1;
    }
  }

  if (g_active) {
    if ((UINT)w_param == WM_MOUSEMOVE) {
      DWORD now = GetTickCount();
      g_move_point = st->pt;
      /* Do not consume movement. Returning nonzero for WM_MOUSEMOVE freezes the system
         pointer on some Windows HID stacks, leaving Dagger's needle stuck at the hub. */
      if ((DWORD)(now - g_last_move_tick) >= MOVE_MIN_INTERVAL_MS && InterlockedExchange(&g_move_pending, 1) == 0) {
        g_last_move_tick = now;
        PostThreadMessage(g_main_thread, APP_EVENT_MOVE, (WPARAM)g_active_session, (LPARAM)g_active_session);
      }
      return CallNextHookEx(g_mouse_hook, code, w_param, l_param);
    }
    /* A second DOWN while the radial is up is consumed with its eventual UP.
       Do not consume an unpaired UP: it may belong to a press that predated Dagger. */
    if (is_down_message(w_param) && button) {
      remember_suppressed_button(button);
      if (g_active_toggle) {
        /* Toggle mode: a left click picks the sector under the pointer; pressing the opening
           button again cancels. Both are consumed together with their UP. */
        if (button == 1) close_active(TRUE);
        else if (button == g_active_button) close_active(FALSE);
      }
      return 1;
    }
    if ((UINT)w_param == WM_MOUSEWHEEL || (UINT)w_param == WM_MOUSEHWHEEL) return 1;
  }

  return CallNextHookEx(g_mouse_hook, code, w_param, l_param);
}

static unsigned modifier_for_vk(DWORD vk) {
  switch (vk) {
    case VK_CONTROL: case VK_LCONTROL: case VK_RCONTROL: return AZY_MOD_CTRL;
    case VK_MENU: case VK_LMENU: case VK_RMENU: return AZY_MOD_ALT;
    case VK_SHIFT: case VK_LSHIFT: case VK_RSHIFT: return AZY_MOD_SHIFT;
    default: return 0;
  }
}

static LRESULT CALLBACK low_level_key_proc(int code, WPARAM w_param, LPARAM l_param) {
  const KBDLLHOOKSTRUCT *st = (const KBDLLHOOKSTRUCT *)l_param;
  BOOL down;
  BOOL up;
  if (code < HC_ACTION || !st) return CallNextHookEx(g_key_hook, code, w_param, l_param);
  down = (w_param == WM_KEYDOWN || w_param == WM_SYSKEYDOWN);
  up = (w_param == WM_KEYUP || w_param == WM_SYSKEYUP);

  /* A key may have closed the previous wheel already. Pair its UP before looking
     at the current active state so Escape/Windows never become lone app keyups. */
  if (up) {
    DWORD paired = take_suppressed_key(st->vkCode);
    if (paired) {
      /* Hold mode on a keyboard binding: letting go of the key commits, exactly like the mouse. */
      if (g_active && !g_active_toggle && g_active_key && st->vkCode == g_active_key && paired == g_active_session) close_active(TRUE);
      return 1;
    }
  }
  /* Auto-repeat of a key whose DOWN we already consumed must never re-open or leak. */
  if (down && st->vkCode < 256 && g_suppressed_key_ups[st->vkCode]) return 1;
  if (!g_active && down && !modifier_for_vk(st->vkCode)) {
    int kwheel = matching_key_wheel(held_mods(), st->vkCode);
    if (kwheel >= 0) {
      POINT origin;
      if (!GetCursorPos(&origin)) { origin.x = 0; origin.y = 0; }
      prune_stale_suppression();
      begin_wheel(kwheel, origin, TRUE);
      if (g_active) {
        g_suppressed_key_ups[st->vkCode] = 1;
        g_suppressed_key_sessions[st->vkCode] = g_active_session;
      }
      return 1;
    }
  }
  if (!g_active) return CallNextHookEx(g_key_hook, code, w_param, l_param);
  if (g_active_toggle && down) {
    /* Toggle mode keys: Enter picks, the opening key again cancels. */
    if (st->vkCode == VK_RETURN) { remember_suppressed_key(st->vkCode); close_active(TRUE); return 1; }
    if (g_active_key && st->vkCode == g_active_key) { remember_suppressed_key(st->vkCode); close_active(FALSE); return 1; }
  }

  /* Escape cancels rather than becoming an application command; Windows keys
     never open Start through the transparent wheel. Only keys whose DOWN we
     consumed are paired; typing and non-binding shortcuts keep flowing. */
  if (st->vkCode == VK_ESCAPE) {
    if (down) {
      remember_suppressed_key(st->vkCode);
      close_active(FALSE);
      return 1;
    }
    /* Escape may have been held before Dagger opened. Its DOWN was not ours,
       so forwarding this unpaired UP is safer than leaving the target stuck. */
    return CallNextHookEx(g_key_hook, code, w_param, l_param);
  }
  if (st->vkCode == VK_LWIN || st->vkCode == VK_RWIN) {
    if (down) {
      remember_suppressed_key(st->vkCode);
      return 1;
    }
    /* Same rule for a Windows-key press that predated this session. */
    return CallNextHookEx(g_key_hook, code, w_param, l_param);
  }
  if (up) {
    unsigned released = modifier_for_vk(st->vkCode);
    if (released && (g_active_mods & released) && !g_active_toggle) {
      /* This key DOWN reached the target before it started Dagger. Its matching
         UP must reach it too; closing first only retires the radial transaction. */
      close_active(TRUE);
      return CallNextHookEx(g_key_hook, code, w_param, l_param);
    }
  }
  return CallNextHookEx(g_key_hook, code, w_param, l_param);
}

static void apply_config(char *line) {
  Binding next[WHEEL_COUNT];
  char *ctx = NULL;
  char *tok;
  int i;
  memset(next, 0, sizeof(next));
  tok = strtok_s(line, "\t", &ctx); /* C */
  tok = strtok_s(NULL, "\t", &ctx); /* enabled */
  if (!tok || atoi(tok) == 0) {
    EnterCriticalSection(&g_lock);
    memset(g_bindings, 0, sizeof(g_bindings));
    g_enabled = FALSE;
    LeaveCriticalSection(&g_lock);
    /* The command reader is not the low-level-hook owner. Serialize teardown
       through the main pump so it cannot race a hook callback or a new session. */
    PostThreadMessage(g_main_thread, APP_EVENT_CANCEL, 0, 0);
    return;
  }
  {
    char *tk[32];
    int n = 0;
    int at = 0;
    while (n < 32 && (tok = strtok_s(NULL, "\t", &ctx)) != NULL) tk[n++] = tok;
    while (at + 2 < n) {
      char *id = tk[at];
      char *mods = tk[at + 1];
      char *button = tk[at + 2];
      char *mode = "0";
      char *key = "0";
      int wheel;
      int btn;
      long vk;
      at += 3;
      /* v1.23 adds <mode> <vk> after the button; the old three-field form is still accepted. */
      if (at + 1 < n + 0 && wheel_from_name(tk[at]) < 0) { mode = tk[at]; key = tk[at + 1]; at += 2; }
      wheel = wheel_from_name(id);
      btn = atoi(button);
      vk = atol(key);
      if (wheel >= 0 && ((btn >= 1 && btn <= 5) || (vk > 0 && vk < 256))) {
        next[wheel].enabled = TRUE;
        next[wheel].mods = mods_from_name(mods);
        next[wheel].button = (vk > 0 && vk < 256) ? 0 : btn;
        next[wheel].vk = (vk > 0 && vk < 256) ? (DWORD)vk : 0;
        next[wheel].toggle = atoi(mode) == 1 ? 1 : 0;
      }
    }
  }
  EnterCriticalSection(&g_lock);
  memcpy(g_bindings, next, sizeof(next));
  g_enabled = TRUE;
  LeaveCriticalSection(&g_lock);
  for (i = 0; i < WHEEL_COUNT; i++) (void)i;
}

/* K/R accept a session token after one tab. Bare commands remain valid for an
   orderly shutdown, but malformed/stale text is never allowed to target input. */
static BOOL parse_scoped_session(const char *line, char opcode, DWORD *session_out) {
  char *end = NULL;
  unsigned long value;
  if (!line || !session_out || line[0] != opcode) return FALSE;
  if (line[1] == '\0') {
    *session_out = 0;
    return TRUE;
  }
  if (line[1] != '\t' || !line[2]) return FALSE;
  value = strtoul(line + 2, &end, 10);
  if (!end || *end != '\0' || value > 0xffffffffUL) return FALSE;
  *session_out = (DWORD)value;
  return TRUE;
}

static DWORD WINAPI command_thread(LPVOID unused) {
  char pending[1024];
  size_t used = 0;
  char buf[256];
  DWORD read = 0;
  (void)unused;
  while (!InterlockedCompareExchange(&g_quitting, 0, 0) && g_stdin_handle && g_stdin_handle != INVALID_HANDLE_VALUE) {
    if (!ReadFile(g_stdin_handle, buf, sizeof(buf), &read, NULL) || read == 0) {
      PostThreadMessage(g_main_thread, APP_EVENT_QUIT, 0, 0);
      break;
    }
    {
      DWORD i;
      for (i = 0; i < read; i++) {
        char c = buf[i];
        if (c == '\r') continue;
        if (c == '\n') {
          pending[used] = '\0';
          if (pending[0] == 'C' && pending[1] == '\t') apply_config(pending);
          else if (pending[0] == 'V' && pending[1] == '\t') {
            int wheel = wheel_from_name(pending + 2);
            if (wheel >= 0) PostThreadMessage(g_main_thread, APP_EVENT_PREVIEW, (WPARAM)wheel, 0);
          } else {
            DWORD session = 0;
            if (parse_scoped_session(pending, 'K', &session)) {
              /* Never mutate g_active from this pipe thread: the low-level hooks
                 and cursor transaction share the owner message loop. */
              PostThreadMessage(g_main_thread, APP_EVENT_CANCEL, (WPARAM)session, 0);
            } else if (parse_scoped_session(pending, 'R', &session)) {
              PostThreadMessage(g_main_thread, APP_EVENT_RESTORE, (WPARAM)session, 0);
            } else if (strcmp(pending, "Q") == 0) {
              PostThreadMessage(g_main_thread, APP_EVENT_QUIT, 0, 0);
            }
          }
          used = 0;
        } else if (used + 1 < sizeof(pending)) {
          pending[used++] = c;
        } else {
          /* Malformed/overlong command: discard only that line. */
          used = 0;
        }
      }
    }
  }
  return 0;
}

static DWORD WINAPI parent_watch_thread(LPVOID data) {
  DWORD pid = (DWORD)(uintptr_t)data;
  HANDLE parent;
  if (!pid) return 0;
  parent = OpenProcess(SYNCHRONIZE, FALSE, pid);
  if (!parent) return 0; /* parent may have already exited; command pipe will close too */
  while (!InterlockedCompareExchange(&g_quitting, 0, 0)) {
    DWORD result = WaitForSingleObject(parent, 500);
    if (result == WAIT_OBJECT_0) {
      PostThreadMessage(g_main_thread, APP_EVENT_QUIT, 0, 0);
      break;
    }
    if (result == WAIT_FAILED) break;
  }
  CloseHandle(parent);
  return 0;
}

static DWORD parent_pid_from_command_line(void) {
  int argc = 0;
  LPWSTR *argv = CommandLineToArgvW(GetCommandLineW(), &argc);
  DWORD pid = 0;
  if (argv && argc > 1) pid = (DWORD)wcstoul(argv[1], NULL, 10);
  if (argv) LocalFree(argv);
  return pid;
}

int WINAPI WinMain(HINSTANCE instance, HINSTANCE previous, LPSTR command, int show) {
  MSG msg;
  HANDLE thread;
  DWORD parent_pid;
  BOOL mouse_ok;
  BOOL key_ok;
  (void)instance; (void)previous; (void)command; (void)show;

  InitializeCriticalSection(&g_lock);
  InitializeCriticalSection(&g_out_lock);
  g_main_thread = GetCurrentThreadId();
  g_stdin_handle = GetStdHandle(STD_INPUT_HANDLE);
  g_stdout_handle = GetStdHandle(STD_OUTPUT_HANDLE);
  set_dpi_awareness();
  init_cursor_functions();
  /* Create this thread's message queue before helper threads post to it. */
  PeekMessage(&msg, NULL, WM_USER, WM_USER, PM_NOREMOVE);

  g_mouse_hook = SetWindowsHookExW(WH_MOUSE_LL, low_level_mouse_proc, GetModuleHandleW(NULL), 0);
  g_key_hook = SetWindowsHookExW(WH_KEYBOARD_LL, low_level_key_proc, GetModuleHandleW(NULL), 0);
  mouse_ok = g_mouse_hook != NULL;
  key_ok = g_key_hook != NULL;
  report_status(STATUS_GUARD, mouse_ok, mouse_ok ? 0 : GetLastError());
  emit_line("R\t%d\t%lu", (mouse_ok && key_ok) ? 1 : 0, (unsigned long)((mouse_ok && key_ok) ? 0 : GetLastError()));

  if (!mouse_ok || !key_ok) {
    if (g_mouse_hook) UnhookWindowsHookEx(g_mouse_hook);
    if (g_key_hook) UnhookWindowsHookEx(g_key_hook);
    DeleteCriticalSection(&g_out_lock);
    DeleteCriticalSection(&g_lock);
    return 2;
  }

  thread = CreateThread(NULL, 0, command_thread, NULL, 0, NULL);
  if (thread) CloseHandle(thread);
  parent_pid = parent_pid_from_command_line();
  thread = CreateThread(NULL, 0, parent_watch_thread, (LPVOID)(uintptr_t)parent_pid, 0, NULL);
  if (thread) CloseHandle(thread);

  while (!InterlockedCompareExchange(&g_quitting, 0, 0) && GetMessage(&msg, NULL, 0, 0) > 0) {
    if (msg.message == APP_EVENT_OPEN) {
      int wheel = (int)msg.wParam;
      DWORD session = (DWORD)msg.lParam;
      /* The hook has already returned 1 by this point. Now perform the slightly heavier cursor
         work, then tell Node to create the visual wheel only at the corrected physical centre. */
      activate_active_wheel(wheel, session);
      if (g_active && g_active_wheel == wheel && session == g_active_session) {
        emit_line("O\t%s\t%ld\t%ld\t%lu", WHEEL_NAMES[wheel], (long)g_open_point.x, (long)g_open_point.y, (unsigned long)session);
      }
    } else if (msg.message == APP_EVENT_MOVE) {
      DWORD session = (DWORD)msg.lParam;
      POINT p = g_move_point;
      InterlockedExchange(&g_move_pending, 0);
      if (g_active && session && session == g_active_session) {
        emit_line("M\t%ld\t%ld\t%lu", (long)p.x, (long)p.y, (unsigned long)session);
      }
    } else if (msg.message == APP_EVENT_CLOSE) {
      DWORD session = (DWORD)msg.lParam;
      /* Physical confinement ends immediately on close; the blank cursor itself
         stays through the visual fade and is restored only by the matching R/timer. */
      if (session && session == g_cursor_session) ClipCursor(NULL);
      emit_line("X\t%d\t%lu", msg.wParam ? 1 : 0, (unsigned long)session);
    } else if (msg.message == APP_EVENT_ARM_RESTORE) {
      DWORD session = (DWORD)msg.wParam;
      if (!g_active && session && session == g_cursor_session) {
        KillTimer(NULL, TIMER_RESTORE);
        g_restore_timer_session = session;
        SetTimer(NULL, TIMER_RESTORE, RESTORE_FALLBACK_MS, NULL);
      }
    } else if (msg.message == APP_EVENT_RESTORE) {
      KillTimer(NULL, TIMER_RESTORE);
      restore_cursor_for_session((DWORD)msg.wParam);
    } else if (msg.message == APP_EVENT_CANCEL) {
      DWORD session = (DWORD)msg.wParam;
      if (g_active && (!session || session == g_active_session)) close_active(FALSE);
    } else if (msg.message == APP_EVENT_PREVIEW) {
      POINT p;
      if (get_cursor_point(&p)) begin_wheel((int)msg.wParam, p, FALSE);
    } else if (msg.message == APP_EVENT_STATUS) {
      int part = (int)msg.wParam;
      uintptr_t packed = (uintptr_t)msg.lParam;
      BOOL ok = (packed & 1) ? TRUE : FALSE;
      DWORD err = (DWORD)(packed >> 1);
      if (part >= 0 && part < STATUS_COUNT) emit_line("S\t%s\t%d\t%lu", STATUS_NAMES[part], ok ? 1 : 0, (unsigned long)err);
    } else if (msg.message == APP_EVENT_QUIT) {
      InterlockedExchange(&g_quitting, 1);
      break;
    } else if (msg.message == WM_TIMER && msg.wParam == TIMER_RESTORE) {
      DWORD session = g_restore_timer_session;
      KillTimer(NULL, TIMER_RESTORE);
      restore_cursor_for_session(session);
    } else {
      TranslateMessage(&msg);
      DispatchMessage(&msg);
    }
  }

  InterlockedExchange(&g_quitting, 1);
  KillTimer(NULL, TIMER_RESTORE);
  ClipCursor(NULL);
  restore_cursor();
  if (g_mouse_hook) UnhookWindowsHookEx(g_mouse_hook);
  if (g_key_hook) UnhookWindowsHookEx(g_key_hook);
  DeleteCriticalSection(&g_out_lock);
  DeleteCriticalSection(&g_lock);
  return 0;
}
