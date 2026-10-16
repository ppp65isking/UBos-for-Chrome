#!/usr/bin/env bash
set -euo pipefail
[[ "${CODESPACES:-}" == true ]] || { echo 'UBos desktop preview startup is only enabled in Codespaces.' >&2; exit 1; }
runner="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
state="${XDG_RUNTIME_DIR:-/tmp}/ubos-remote-$UID"
mkdir -p "$state"; chmod 700 "$state"
exec 8>"$state/desktop-preview.lock"
flock -n 8 || { echo 'UBos desktop preview startup is already in progress.'; exit 0; }
pid=''
if [[ -r "$state/desktop-preview.pid" ]]; then read -r pid < "$state/desktop-preview.pid" || true; fi
if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null && [[ -r "/proc/$pid/cmdline" ]] && tr '\0' '\n' < "/proc/$pid/cmdline" | grep -Fxq -- "$runner/desktop-preview.mjs"; then
  echo 'UBos desktop preview is already running.'
  exit 0
fi
cd "$runner"
umask 077
nohup node "$runner/desktop-preview.mjs" > "$state/desktop-preview.log" 2>&1 8>&- &
pid=$!; printf '%s\n' "$pid" > "$state/desktop-preview.pid"
sleep 2
if ! kill -0 "$pid" 2>/dev/null; then
  echo "UBos desktop preview failed. Review the private log: $state/desktop-preview.log" >&2
  exit 1
fi
echo "UBos desktop preview started. Its connection code is in the private log: $state/desktop-preview.log"
echo 'Keep port 7682 Private. Chrome starts when the embedded UBos Browser opens and closes with that window.'
