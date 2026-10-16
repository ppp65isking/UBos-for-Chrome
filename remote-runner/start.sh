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
