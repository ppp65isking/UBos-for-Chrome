#!/usr/bin/env bash
# Windows-11-style taskbar for the UBos Linux desktop (Fluxbox + tint2 + rofi).
#
# Installs the panel + Start menu config from the repo, hides Fluxbox own
# toolbar, and (re)starts tint2 on the desktop display. Idempotent and
# best-effort: it never stops the caller if something is missing. Safe to run
# on every postStart and by hand (start.sh calls it in the background).
set -u
here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
log="${XDG_STATE_HOME:-$HOME/.local/state}/ubos/win11-taskbar.log"
mkdir -p "$(dirname -- "$log")" 2>/dev/null || true
exec >>"$log" 2>&1 || true
echo "[$(date -Is)] win11-taskbar: repo=$here"

# Wait for the desktop X display (desktop-lite runs TigerVNC on :1).
display=":1"
for i in $(seq 1 30); do
    if [ -S "/tmp/.X11-unix/X${display#:}" ]; then
        break
    fi
    sleep 1
done
export DISPLAY="$display"
if [ ! -S "/tmp/.X11-unix/X${display#:}" ]; then
    echo "win11-taskbar: no X display on $display after 30s; giving up"
    exit 0
fi

# Make sure the tools are installed (best effort).
for tool in tint2 rofi; do
    if ! command -v "$tool" >/dev/null 2>&1; then
        echo "win11-taskbar: installing missing tool: $tool"
        sudo apt-get update -qq >/dev/null 2>&1 || true
        sudo apt-get install -y -qq "$tool" >/dev/null 2>&1 || true
    fi
done
if ! command -v tint2 >/dev/null 2>&1; then
    echo "win11-taskbar: tint2 not available, giving up"
    exit 0
fi

# Install the configs from the repo (rebuild-safe copies).
mkdir -p "$HOME/.config/tint2" "$HOME/.config/rofi" 2>/dev/null || true
sed "s|__TASKBAR_DIR__|$here|g" "$here/tint2rc" > "$HOME/.config/tint2/tint2rc" 2>/dev/null || true
cp -f "$here/rofi-win11.rasi" "$HOME/.config/rofi/win11.rasi" 2>/dev/null || true
chmod +x "$here/start-menu.sh" "$here/win11-taskbar.sh" 2>/dev/null || true

# Hide Fluxbox own toolbar (the tint2 panel replaces it).
init="$HOME/.fluxbox/init"
if [ -f "$init" ]; then
    if grep -q "^session.screen0.toolbar.visible:" "$init"; then
        sed -i "s|^session.screen0.toolbar.visible:.*|session.screen0.toolbar.visible: false|" "$init"
    else
        echo "session.screen0.toolbar.visible: false" >>"$init"
    fi
    # Ask the running Fluxbox to reload (windows stay open).
    fluxbox-remote Reconfigure 2>/dev/null || true
fi

# (Re)start the panel if it is not already running.
if pgrep -x tint2 >/dev/null 2>&1; then
    echo "win11-taskbar: tint2 already running"
else
    nohup tint2 -c "$HOME/.config/tint2/tint2rc" >/dev/null 2>&1 &
    echo "win11-taskbar: tint2 started (pid $!)"
fi
echo "[$(date -Is)] win11-taskbar: done"
