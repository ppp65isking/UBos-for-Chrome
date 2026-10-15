#!/usr/bin/env bash
set -euo pipefail
fail() { echo "$*" >&2; exit 1; }
[[ "${CODESPACES:-}" == true ]] || fail 'Run this helper inside your personal GitHub Codespace.'
[[ "$(uname -s)" == Linux && "$(uname -m)" == x86_64 ]] || fail 'This preview supports Linux x86_64 only.'
[[ "$EUID" -ne 0 ]] || fail 'Run as the regular Codespaces user, not root. This helper does not disable the Chromium sandbox.'
action="${1:-}"
case "$action" in install|run|status|uninstall) ;; *) fail 'Usage: bash remote-runner/discord.sh {install|run|status|uninstall}' ;; esac
base="$HOME/.local/share/ubos/apps"
prefix="$base/discord"
binary="$prefix/Discord/Discord"
case "$action" in
  install)
    command -v curl >/dev/null || fail 'curl is required.'
    command -v python3 >/dev/null || fail 'Python 3 with tarfile.data_filter is required.'
    python3 -c 'import tarfile; assert hasattr(tarfile, "data_filter"), "Update Python: safe archive extraction is required."'
    [[ ! -e "$prefix" && ! -L "$prefix" ]] || fail 'A managed installation already exists. Close Discord and uninstall it before reinstalling.'
    mkdir -p "$base"
    stage="$(mktemp -d "$base/.discord-install.XXXXXX")"
    trap 'rm -rf -- "$stage"' EXIT
    echo 'Downloading the official stable Discord Linux archive. Running Discord later executes vendor software.'
    curl --fail --location --proto '=https' --proto-redir '=https' --tlsv1.2 --retry 2 --connect-timeout 30 --max-time 600 'https://discord.com/api/download?platform=linux&format=tar.gz' -o "$stage/discord.tar.gz"
    mkdir "$stage/unpacked"
    python3 - "$stage/discord.tar.gz" "$stage/unpacked" <<'PY'
import sys, tarfile
with tarfile.open(sys.argv[1], 'r:gz') as archive:
    archive.extractall(sys.argv[2], filter='data')
PY
    [[ -x "$stage/unpacked/Discord/Discord" ]] || fail 'Archive did not contain the expected executable. Nothing installed.'
    mv -T -- "$stage/unpacked" "$prefix"
    echo 'Managed Discord files installed. GUI launch, dependencies, streaming, audio and microphone are NOT verified.'
    ;;
  status)
    [[ -x "$binary" ]] || fail 'Discord is not installed in the UBos-managed location.'
    echo "Managed executable found: $binary"
    echo 'This checks files only, not whether Discord is running or connected.'
    if [[ -n "${DISPLAY:-}" || -n "${WAYLAND_DISPLAY:-}" ]]; then
      echo 'A display environment variable is present; display connectivity is not verified.'
    else
      echo 'No display environment variable is set. A graphical session is still required.'
    fi
    ;;
  run)
    [[ -x "$binary" ]] || fail 'Install first: bash remote-runner/discord.sh install'
    [[ -n "${DISPLAY:-}" || -n "${WAYLAND_DISPLAY:-}" ]] || fail 'Discord needs a graphical Linux session. The terminal runner alone cannot display it; browser GUI streaming is not implemented yet.'
    cd "$prefix/Discord"
    exec "$binary"
    ;;
  uninstall)
    [[ -e "$prefix" || -L "$prefix" ]] || fail 'No managed Discord installation found.'
    echo 'Close any running managed Discord process before removal.'
    read -r -p 'Remove only the UBos-managed Discord files? Type REMOVE: ' answer
    [[ "$answer" == REMOVE ]] || fail 'Cancelled.'
    rm -rf -- "$prefix"
    echo 'Managed program files removed. Discord account/session data in your home directory and unrelated installations were not removed. This does not stop a running process.'
    ;;
esac
