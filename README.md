# UBos-for-Chrome
UBos for Chrome — a browser desktop with Notes, File Explorer, themes, settings, and a coming-soon Storage app. Inspired by Windows 11, liquid glass, and Material 3 Expressive.

## UBos 2.0
UBos 2.0 adds the UB Store, persistent remote-app launchers, app management, and a private Codespaces remote-launch flow.

### Included
- UB Store with Codex for UBos and Claude Code for UBos.
- Persistent launchers for remote command-line tools.
- Settings → Apps for removing launchers and uninstalling installed HTML apps.
- Managed Codespaces helpers to install, launch, check, and uninstall Codex or Claude Code.
- One-click launch of the saved private Codespaces terminal.
- Automatic runner startup when a Codespace starts.
- UB Store search and categories, with a separate Google Chrome launcher alongside the built-in Browser.
- Private Chrome/Discord runtime diagnostics, managed CLI install/version checks, and an in-memory noVNC clipboard bridge.
- Additional editable Browser shortcuts for common web destinations.

The regular public site can add the Google Chrome launcher, but real Chrome runs only in the authenticated private Codespaces desktop preview on port 7682. The built-in Browser remains available without that preview.

### Remote requirements
- A personal GitHub Codespace.
- Port 7681 kept Private.
- The runner connection code from the private runner log.
- A supported vendor account for Codex or Claude Code.

### Not included
- Embedded private-terminal access inside UBos.
- Automatic wake-up or shutdown of a stopped Codespace.
- Official vendor app icons or vendor-published UBos editions.

A launcher being added does not mean the remote package is installed. Use the app’s managed install command in a fresh Codespace shell and review it before running.
