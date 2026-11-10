#!/usr/bin/env bash
# Windows-style Start menu for the UBos Linux desktop.
# Launched by the tint2 Start button; opens a searchable list of installed
# apps (rofi drun). Falls back to the Fluxbox root menu only when rofi is
# missing or fails to start (rofi exit codes 10+ mean a real error; 1 means
# the user just closed the menu with Escape).
set -u
here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
export DISPLAY="${DISPLAY:-:1}"
if command -v rofi >/dev/null 2>&1; then
    theme="$here/rofi-win11.rasi"
    if [ -r "$theme" ]; then
        rofi -show drun -theme "$theme" -display-drun "Start"
    else
        rofi -show drun -display-drun "Start"
    fi
    code=$?
    if [ "$code" -ge 10 ]; then
        fluxbox-remote RootMenu
    fi
else
    fluxbox-remote RootMenu
fi
