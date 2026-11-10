#!/usr/bin/env bash
# tint2 taskbar watchdog: relaunch tint2 and restore 1360x768 if they go away.
# Launched detached from remote-runner/start.sh on every postStart.
# Checks every 15 seconds; single instance, guarded by a lock file.
set -uo pipefail
state_dir="${XDG_RUNTIME_DIR:-/tmp}/ubos-remote-$UID"
mkdir -p "$state_dir"
# Single instance: exit if another watchdog is already watching. A lock
# file is not used here: a killed watchdog leaves children holding its lock
# fd, which would block every later watchdog.
if pgrep -f "tint2-watchdog.sh" 2>/dev/null | grep -vx "$$" | grep -q .; then
  echo "tint2 watchdog is already running."
  exit 0
fi
# Give a taskbar launcher started together with this watchdog a moment to start tint2 before the first check.
sleep 5
launcher="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/win11-taskbar.sh"
while true; do
  if ! pgrep -x tint2 >/dev/null 2>&1; then
    echo "$(date -Is) tint2 is not running; relaunching the taskbar."
    bash "$launcher" >>"$state_dir/win11-taskbar.log" 2>&1 7>&- 8>&- 9>&- || true
  fi
  if [ -S /tmp/.X11-unix/X1 ] && ! DISPLAY=:1 xrandr 2>/dev/null | grep -q "current 1360 x 768"; then
    DISPLAY=:1 xrandr -s 1360x768 2>/dev/null || true
  fi
  sleep 15
done
