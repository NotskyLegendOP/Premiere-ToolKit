$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not (Test-Path "src-tauri\src\main.rs")) { Write-Host "ERROR: run this from the project folder (the one that contains src-tauri)." -ForegroundColor Red; pause; exit 1 }
$utf8 = New-Object System.Text.UTF8Encoding $false
$rs = "src-tauri\src\main.rs"; Copy-Item $rs "$rs.captions.bak" -Force
Copy-Item "captions.rs" "src-tauri\src\captions.rs" -Force
$lines = New-Object System.Collections.Generic.List[string]
foreach ($l in (Get-Content $rs)) { $lines.Add($l) }
if (-not ($lines | Where-Object { $_ -match '^\s*mod captions;' })) {
  $idx = -1; for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -match '^\s*#!\[') { $idx = $i } }
  $lines.Insert($idx + 1, "mod captions;")
}
$t = ($lines -join "`r`n")
if ($t -notmatch 'captions::words_srt') { $t = $t -replace 'generate_handler!\[', 'generate_handler![captions::words_srt, ' }
if ($t -notmatch 'captions::save_text_file') { $t = $t -replace 'captions::words_srt', 'captions::words_srt, captions::save_text_file' }
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $rs), $t, $utf8)
$chk = Get-Content $rs -Raw
if (($chk -match 'mod captions;') -and ($chk -match 'captions::words_srt') -and ($chk -match 'captions::save_text_file')) { Write-Host "main.rs patched. Now run: npm run tauri dev" -ForegroundColor Green }
else { Write-Host "WARNING: could not patch main.rs automatically. Add 'mod captions;' near the top and 'captions::words_srt,' and 'captions::save_text_file,' inside tauri::generate_handler![ ... ]" -ForegroundColor Yellow }
pause
