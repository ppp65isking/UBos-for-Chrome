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
- UB Store search and categories, with a separate Google Chrome launcher alongside the direct Browser shortcut.
- A Browser shortcut that embeds the private Codespaces Chrome viewer, plus a Website Browser that opens sites in native Chrome tabs by default and keeps UBos tabs, bookmarks, and entered-address history; optional embedded mode is available for sites that allow framing. Games includes 2048 and two-player Tic-Tac-Toe.
- Private Chrome/Discord runtime diagnostics, managed CLI install/version checks, and an in-memory noVNC clipboard bridge.
- Additional editable Browser shortcuts for common web destinations.

The Website Browser opens destinations in new tabs in the user's actual Chrome browser; it does not proxy traffic or pretend to be a standalone browser engine. This lets sites such as Google use normal Chrome cookies, sign-in, downloads, and browser features instead of refusing to load in an iframe. The browser's optional embedded mode remains limited to sites that permit framing.

The separate Chrome launcher opens the authenticated private Codespaces desktop preview on port 7682; it is not a browser process running on GitHub Pages. If a port-6080 or port-7681 Codespaces URL is already saved in UBos, it derives the matching port-7682 URL; otherwise, copy the port-7682 URL from the Codespaces Ports panel and enter it once—there is no need to open that URL as a separate website.

The Chrome preview shares the Codespace desktop and stores its browser profile in `.ubos/chrome-profile`. GitHub private-port authentication can still require sign-in; a static public page cannot bypass browser authentication or third-party-cookie restrictions. Keep the forwarded port Private, replace the default VNC password, and do not share the Codespace. This is an experimental preview, not a security-reviewed environment; avoid signing into a primary or sensitive account until it has been independently reviewed. UBos cannot wake a stopped Codespace from the static public page.

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
