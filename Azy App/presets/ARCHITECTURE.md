# Azy platform architecture (v13)

**Azy is the product.** The Premiere extension is Azy running inside Premiere Pro. The desktop
app is Azy's hub. Flow is one shared capability. The link between them is an internal runtime
detail the user never manages.

```
                          AZY
        ┌──────────────────┴──────────────────┐
   Azy Desktop (azy/)                    Azy Core (packages/core, bundled as presets/engine.js)
   • Files (desktop-only)                • CommandBus      AZY_COMMAND {capability, action, params, target}
   • Presets / Flow / Snap panes         • ModuleManager   host detection, install/update/verify, AzyStatus
   • module card ("Azy in Premiere Pro") • Flow / Snap / Presets / Drag (capabilities)
   • serves its own UI to hosts          • bridge/          internal transport to host runtimes
        │                                        │
        └────────────── Azy Premiere module ─────┘   (packages/core/src/modules/premiere-module.ts)
                     ┌────────┴─────────┐
        UI surface: CEP "Azy"       runtime: UXP "Azy Runtime"
        (presets/cep)               (presets/connector, packages/connector)
        hosts Azy's own HTML/CSS/JS shows one status line; executes
        served by the running app   commands against Adobe's premierepro API
                     └────────┬─────────┘
                        Premiere Pro
```

## What each layer owns

| Layer | Owns | Never does |
|---|---|---|
| **Core – CommandBus** | routing `capability.action`, target gating (Premiere ready?), structured results | UI, host APIs |
| **Core – ModuleManager** | which hosts exist/run, install state per module part, auto install/update, `AzyStatus` with one user-facing summary (`"Azy is running in Premiere Pro 2026"`, `"Restart Premiere Pro to finish updating Azy"`) | Premiere specifics (they live in `premiere-module.ts`) |
| **Premiere module** | paths (CEP extensions dir, UXP plugins dir), CEP PlayerDebugMode, UPIA-based UXP install, host probe, connection mapping | anything another host would need differently |
| **Flow / Snap / Presets** | logic + storage; same objects for every surface | transport |
| **Bridge** | WS transport, auth (auto-link when Azy's panel is open in Premiere; typed code as fallback), `/panel/*` HTTP that serves the UI | product decisions |
| **UXP runtime** | executing commands inside Premiere (keyframes, effects, selection), reporting host state | its own Flow/preset UI (removed in v13) |
| **CEP surface** | a full-size iframe of Azy's UI, discovery of the running app via `<userData>/bridge/panel.json` | logic |

## Lifecycle Azy manages

1. Azy starts → `ModuleManager.refresh()`: is Premiere installed? which version? supported?
2. Missing/outdated CEP surface → copied to the per-user CEP folder, PlayerDebugMode set. No admin.
3. UXP runtime → if Adobe's UnifiedPluginInstallerAgent exists, Azy installs `azy-premiere-runtime.ccx`
   silently; otherwise the status shows the single manual step (Adobe requires its installer or the
   UXP Developer Tool for UXP plugins — there is no supported file-copy path).
4. Premiere starts → runtime finds Azy on loopback → tries zero-code link (accepted while Azy's panel
   is open in Premiere) → `"Azy is running in Premiere Pro 2026"`.
5. Runtime gone / Premiere closed / version mismatch → one status line + next step; `Fix`/`Check` button
   re-runs the setup; everything is also available as `modules.repair` / `modules.refresh` commands.

## Shared state
Favorites, Flow presets, Snap settings, selection, connection and module status are single objects in
core; every surface subscribes to the same `azy:presets:evt:*` broadcasts (Electron IPC in the app,
SSE in the Premiere panel) so a change in one place shows everywhere immediately.

## Adding a host (e.g. After Effects)
Write `modules/aftereffects-module.ts` (host probe + parts + connection), register it in
`createPresetsRuntime`, gate the `aftereffects` target on the bus, ship its parts under `presets/`.
The UI, Flow logic, bus, status card and CEP shell are reused unchanged.
