#!/usr/bin/env bash
set -euo pipefail
if [[ "${CODESPACES:-}" != true ]]; then echo 'Run this helper only in your personal GitHub Codespace.' >&2; exit 1; fi
action="${1:-}"; app="${2:-}"
case "$action" in install|run|uninstall|status) ;; *) echo 'Usage: bash remote-runner/apps.sh {install|run|uninstall|status} {codex|claude}' >&2; exit 2;; esac
case "$app" in codex) package='@openai/codex'; binary='codex';; claude) package='@anthropic-ai/claude-code'; binary='claude';; *) echo 'Unknown app. Use codex or claude.' >&2; exit 2;; esac
prefix="$HOME/.local/share/ubos/apps/$app"
executable="$prefix/node_modules/.bin/$binary"
case "$action" in
  status) if [[ -x "$executable" ]]; then echo "$app: managed installation found"; "$executable" --version; else echo "$app: not installed in the UBos-managed location"; exit 1; fi;;
  install)
    command -v npm >/dev/null || { echo 'Node.js and npm are required.' >&2; exit 1; }
    if [[ "$app" == claude ]]; then node -e 'if(Number(process.versions.node.split(".")[0])<22){console.error("Claude Code npm installation requires Node.js 22 or newer.");process.exit(1)}'; fi
    echo "Installing $package into $prefix. Vendor package lifecycle scripts may run."
    npm install --prefix "$prefix" --no-audit --no-fund "$package"
    [[ -x "$executable" ]] || { echo 'Installation did not create the expected launcher. Check npm errors and optional dependencies.' >&2; exit 1; }
    "$executable" --version;;
  run) [[ -x "$executable" ]] || { echo "Install first: bash remote-runner/apps.sh install $app" >&2; exit 1; }; exec "$executable";;
  uninstall) command -v npm >/dev/null || { echo 'npm is required.' >&2; exit 1; }; npm uninstall --prefix "$prefix" --ignore-scripts --no-audit --no-fund "$package"; echo 'Managed package removed. Projects, vendor account settings, and unrelated installations were not removed.';;
esac
