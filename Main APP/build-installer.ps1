<#
  Build the Premiere Toolbox installer on Windows.

  Usage (from this folder):
      powershell -ExecutionPolicy Bypass -File .\build-installer.ps1
      powershell -ExecutionPolicy Bypass -File .\build-installer.ps1 -Msi   # also build the .msi

  Needs: Node 20+  and  Rust (MSVC toolchain)  ->  https://rustup.rs
  Tauri downloads NSIS on first run, so the first build takes a while.
#>
param(
  [switch]$Msi,
  [switch]$SkipChecks
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Fail($msg) {
  Write-Host ""
  Write-Host "  $msg" -ForegroundColor Red
  Write-Host ""
  exit 1
}

Write-Host ""
Write-Host "  Premiere Toolbox - installer build" -ForegroundColor Cyan
Write-Host "  ---------------------------------" -ForegroundColor DarkCyan

if (-not $SkipChecks) {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail "Node.js is missing. Install Node 20 from https://nodejs.org and run this again."
  }
  if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Fail "Rust is missing. Install it from https://rustup.rs (choose the MSVC toolchain), reopen the terminal, then run this again."
  }
  Write-Host ("  node  " + (node --version)) -ForegroundColor DarkGray
  Write-Host ("  rust  " + ((rustc --version) -split ' ')[1]) -ForegroundColor DarkGray
}

if (-not (Test-Path "node_modules")) {
  Write-Host "  Installing frontend dependencies..." -ForegroundColor Yellow
  npm ci
  if ($LASTEXITCODE -ne 0) { Fail "npm ci failed." }
}

$bundles = if ($Msi) { "nsis,msi" } else { "nsis" }

Write-Host "  Compiling (this can take 5-15 minutes the first time)..." -ForegroundColor Yellow
npm run tauri -- build --bundles $bundles
if ($LASTEXITCODE -ne 0) { Fail "The Tauri build failed. Scroll up for the first error." }

$root = Join-Path $PSScriptRoot "src-tauri\target\release\bundle"
$found = @()
if (Test-Path (Join-Path $root "nsis")) { $found += Get-ChildItem (Join-Path $root "nsis") -Filter *.exe }
if (Test-Path (Join-Path $root "msi"))  { $found += Get-ChildItem (Join-Path $root "msi")  -Filter *.msi }

Write-Host ""
if ($found.Count -eq 0) {
  Write-Host "  Build finished but no installer was found in $root" -ForegroundColor Red
  exit 1
}

Write-Host "  Done. Installers:" -ForegroundColor Green
foreach ($f in $found) {
  $mb = [math]::Round($f.Length / 1MB, 1)
  Write-Host ("    " + $f.FullName + "  (" + $mb + " MB)") -ForegroundColor Green
}
Write-Host ""
Write-Host "  A portable exe is also at src-tauri\target\release\premiere-toolbox.exe" -ForegroundColor DarkGray
Write-Host ""
