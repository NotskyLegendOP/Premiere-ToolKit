#!/usr/bin/env sh
# Rebuild Azy's intentionally narrow Windows Dagger companion.
# Requires the x64 MinGW-w64 compiler in PATH (or set CC explicitly).
# Optional first argument overrides the output path; no argument refreshes assets/dagger-native.exe.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
CC=${CC:-x86_64-w64-mingw32-gcc}
OUT=${1:-"$ROOT/assets/dagger-native.exe"}

exec "$CC" \
  -std=c11 -Os -s -static -mwindows \
  "$ROOT/presets/native/dagger-native.c" \
  -o "$OUT" \
  -luser32 -lshell32 -lshcore \
  -Wall -Wextra -Wl,--no-insert-timestamp
