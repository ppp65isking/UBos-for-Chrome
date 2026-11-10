#!/usr/bin/env bash
set -euo pipefail
[[ "${CODESPACES:-}" == true ]] || { echo 'UBos runner startup is only enabled in Codespaces.' >&2; exit 1; }
runner="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
state="${XDG_RUNTIME_DIR:-/tmp}/ubos-remote-$UID"
mkdir -p "$state"; chmod 700 "$state"
exec 9>"$state/start.lock"
flock -n 9 || { echo 'UBos runner startup is already in progress.'; exit 0; }
pid=''
if [[ -r "$state/runner.pid" ]]; then read -r pid < "$state/runner.pid" || true; fi
if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null && [[ -r "/proc/$pid/cmdline" ]] && tr '\0' '\n' < "/proc/$pid/cmdline" | grep -Fxq -- "$runner/server.mjs"; then echo 'UBos remote runner is already running.'; exit 0; fi
cd "$runner"
if [[ ! -d node_modules/node-pty || ! -d node_modules/ws || ! -d node_modules/@xterm/xterm ]]; then echo 'Installing runner dependencies...'; npm install --no-audit --no-fund; fi
umask 077
nohup node "$runner/server.mjs" > "$state/runner.log" 2>&1 9>&- &
pid=$!; printf '%s\n' "$pid" > "$state/runner.pid"
sleep 2
if ! kill -0 "$pid" 2>/dev/null; then echo "Runner failed. Review the private log: $state/runner.log" >&2; exit 1; fi
echo "UBos runner started. Connection code is in the private log: $state/runner.log"
echo 'Keep port 7681 Private. This starts the runner, not a stopped Codespace, and does not enable automatic Codespace shutdown.'
bash "$runner/desktop-preview-start.sh"

# Windows-11-style taskbar (tint2 panel + rofi Start menu) for the Linux desktop.
# The launcher waits for the desktop display itself and is idempotent, so it
# is safe on every postStart and after a rebuild. Best effort: never fail startup.
if [[ -x "$runner/taskbar/win11-taskbar.sh" ]]; then
  nohup bash "$runner/taskbar/win11-taskbar.sh" >>"$state/win11-taskbar.log" 2>&1 &
fi

# Auto-fit for a fresh noVNC connection (Chromebook-size desktop).
# - Default desktop size 1360x768: the VNC server starts at 1440x768 and the
#   old in-session xrandr resize did not survive restarts/rebuilds.
# - noVNC default resize off -> remote, so a fresh browser window fits the
#   remote desktop (ui.js lives outside the repo, so re-apply the patch).
# - Pin the tint2 panel above other windows via Fluxbox [Layer] {2}: it used
#   to live only in ~/.fluxbox/apps, so write it here to survive rebuilds.
# Best effort: never fail startup.
_desktop=":1"
for _i in $(seq 1 30); do
  if [ -S "/tmp/.X11-unix/X${_desktop#:}" ]; then
    break
  fi
  sleep 1
done
if command -v xrandr >/dev/null 2>&1; then
  DISPLAY="$_desktop" xrandr -s 1360x768 2>/dev/null || true
fi
_novnc_ui="/usr/local/novnc/noVNC-1.6.0/app/ui.js"
if [ -f "$_novnc_ui" ]; then
  sudo sed -i "s/UI.initSetting('resize', 'off')/UI.initSetting('resize', 'remote')/" "$_novnc_ui" 2>/dev/null || sed -i "s/UI.initSetting('resize', 'off')/UI.initSetting('resize', 'remote')/" "$_novnc_ui" 2>/dev/null || true
fi
mkdir -p "$HOME/.fluxbox" 2>/dev/null || true
_apps="$HOME/.fluxbox/apps"
if ! grep -qF "[app] (tint2)" "$_apps" 2>/dev/null; then
  {
    echo "[app] (tint2)"
    echo "  [Layer] {2}"
    echo "[end]"
  } >> "$_apps" 2>/dev/null || true
  DISPLAY="$_desktop" fluxbox-remote Reconfigure 2>/dev/null || true
fi
unset _desktop _i _novnc_ui _apps
