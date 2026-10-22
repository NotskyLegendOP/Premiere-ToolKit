$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not (Test-Path "src-tauri\tauri.conf.json")) { Write-Host "ERROR: run this from the project folder (the one that contains src-tauri)." -ForegroundColor Red; pause; exit 1 }
$utf8 = New-Object System.Text.UTF8Encoding $false
function Save($path, $text) { [System.IO.File]::WriteAllText((Join-Path (Get-Location) $path), $text, $utf8) }

# 1) Cargo.toml : add the global-shortcut crate
$cargo = "src-tauri\Cargo.toml"; Copy-Item $cargo "$cargo.bak" -Force
$t = Get-Content $cargo -Raw
if ($t -notmatch "tauri-plugin-global-shortcut") {
  $t = $t -replace "(?m)^\[dependencies\]\s*\r?\n", "[dependencies]`r`ntauri-plugin-global-shortcut = `"2`"`r`n"
  Save $cargo $t
}
Write-Host "Cargo.toml ok"

# 2) main.rs : register the plugin
$rs = "src-tauri\src\main.rs"; Copy-Item $rs "$rs.bak" -Force
$t = Get-Content $rs -Raw
if ($t -notmatch "tauri_plugin_global_shortcut") {
  $t = $t -replace "tauri::Builder::default\(\)", "tauri::Builder::default()`r`n        .plugin(tauri_plugin_global_shortcut::Builder::new().build())"
  Save $rs $t
}
if ((Get-Content $rs -Raw) -notmatch "tauri_plugin_global_shortcut") { Write-Host "WARNING: could not patch main.rs. Add this line after tauri::Builder::default():  .plugin(tauri_plugin_global_shortcut::Builder::new().build())" -ForegroundColor Yellow } else { Write-Host "main.rs ok" }

# 3) tauri.conf.json : add the hidden transparent wheel window
$cfp = "src-tauri\tauri.conf.json"; Copy-Item $cfp "$cfp.bak" -Force
$cf = Get-Content $cfp -Raw | ConvertFrom-Json
$wins = @($cf.app.windows) | Where-Object { $_ }
if (-not ($wins | Where-Object { $_.label -eq "wheel" })) {
  $w = [pscustomobject]@{ label="wheel"; url="index.html#wheel"; title="Wheel"; width=580; height=580; decorations=$false; transparent=$true; alwaysOnTop=$true; visible=$false; resizable=$false; skipTaskbar=$true; shadow=$false; center=$true; focus=$false }
  $cf.app.windows = @($wins) + @($w)
  Save $cfp ($cf | ConvertTo-Json -Depth 30)
}
Write-Host "tauri.conf.json ok"

# 4) capabilities : allow the wheel window + the calls it needs
$cp = "src-tauri\capabilities\default.json"; Copy-Item $cp "$cp.bak" -Force
$c = Get-Content $cp -Raw | ConvertFrom-Json
$need = "global-shortcut:allow-register","global-shortcut:allow-unregister","global-shortcut:allow-unregister-all","global-shortcut:allow-is-registered","core:default","core:window:allow-show","core:window:allow-hide","core:window:allow-set-focus","core:window:allow-center","core:window:allow-unminimize","core:window:allow-destroy","core:window:allow-is-visible"
$perms = @($c.permissions)
foreach ($n in $need) { if (-not ($perms | Where-Object { ($_ -is [string]) -and ($_ -eq $n) })) { $perms += $n } }
$c.permissions = $perms
$wl = @($c.windows); if ($wl -notcontains "wheel") { $wl += "wheel" }; $c.windows = $wl
Save $cp ($c | ConvertTo-Json -Depth 30)
Write-Host "capabilities ok"

# 5) JS side
npm install @tauri-apps/plugin-global-shortcut
Write-Host ""
Write-Host "DONE. Now run:  npm run tauri dev   (Rust will recompile, a few minutes)" -ForegroundColor Green
pause
