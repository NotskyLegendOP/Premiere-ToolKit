; Azy installer hooks (electron-builder NSIS, one-click).
; Install : after the app files land, put the Azy extension where Premiere Pro loads
;           extensions for this user and allow Premiere to load it. Everything is per-user
;           (no admin rights) and Azy re-verifies + repairs it on every launch, so the
;           installer step is a head start, never the only path.
; Uninstall: remove the extension, drop the start-up entry, and delete Azy's bridge/token
;           files so no dead extension or stale link is left behind.
!define AZY_CEP_ID "com.azy.premiere.connector"
!define AZY_CEP_SRC "$INSTDIR\resources\app.asar.unpacked\presets\connector"
!define AZY_CEP_DST "$APPDATA\Adobe\CEP\extensions\${AZY_CEP_ID}"

!macro customInstall
  DetailPrint "Setting up Azy in Premiere Pro…"
  StrCpy $0 "skipped"
  IfFileExists "${AZY_CEP_SRC}\CSXS\manifest.xml" 0 azy_cep_done
    ; Fresh copy: a stale half-installed folder must never survive next to the new one.
    RMDir /r "${AZY_CEP_DST}"
    CreateDirectory "${AZY_CEP_DST}"
    CopyFiles /SILENT "${AZY_CEP_SRC}\*.*" "${AZY_CEP_DST}"
    ; Old Azy (UXP) runtime — one Azy inside Premiere only.
    RMDir /r "$APPDATA\Adobe\UXP\Plugins\External\${AZY_CEP_ID}"
    ; Premiere only loads extensions without an Adobe-issued signature when this flag is set.
    ; Set for every CSXS generation Premiere 2023–2026+ uses; Premiere reads it at start-up.
    WriteRegStr HKCU "Software\Adobe\CSXS.9" "PlayerDebugMode" "1"
    WriteRegStr HKCU "Software\Adobe\CSXS.10" "PlayerDebugMode" "1"
    WriteRegStr HKCU "Software\Adobe\CSXS.11" "PlayerDebugMode" "1"
    WriteRegStr HKCU "Software\Adobe\CSXS.12" "PlayerDebugMode" "1"
    StrCpy $0 "copied"
    IfFileExists "${AZY_CEP_DST}\host\azy.jsx" azy_cep_done 0
      StrCpy $0 "copy-incomplete"
  azy_cep_done:
  ; Per-user log so Azy's diagnostics can show what the installer did.
  CreateDirectory "$APPDATA\Azy"
  FileOpen $1 "$APPDATA\Azy\install.log" a
  FileSeek $1 0 END
  FileWrite $1 "install ${VERSION} premiere-extension=$0$\r$\n"
  FileClose $1
!macroend

!macro customUnInstall
  RMDir /r "${AZY_CEP_DST}"
  RMDir /r "$APPDATA\Adobe\UXP\Plugins\External\${AZY_CEP_ID}"
  ; Start-with-Windows entry (written by app.setLoginItemSettings).
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Azy"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "electron.app.Azy"
  ; Bridge discovery + link tokens: a reinstall must pair fresh, and nothing may point at a
  ; program that is no longer there. Presets/favourites (userData) are kept unless the user
  ; chose to remove app data. PlayerDebugMode is left as-is: other extensions may rely on it.
  RMDir /r "$APPDATA\Azy\bridge"
  RMDir /r "$APPDATA\Azy\presets\bridge"
!macroend
