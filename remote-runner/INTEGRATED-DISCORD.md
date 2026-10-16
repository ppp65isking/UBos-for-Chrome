# Integrated Discord preview

This adds an opt-in private Codespaces origin on port 7682. It reuses the actual UBos frontend but embeds the FULL Linux desktop, not a Discord-only stream. Your normal website, terminal runner and startup hooks are unchanged. Browser data on this origin is separate; add Discord again in UB Store.

After pulling main safely, in a fresh Codespaces Bash shell at the repository root:

```bash
npm --prefix remote-runner install --no-audit --no-fund
node --test remote-runner/desktop-preview.test.mjs
node remote-runner/desktop-preview.mjs
```

The server sets port 7682 Private and prints a URL and temporary engine code. Stop if private-port enforcement fails; do not switch any port to Public. Keep 6080 and 7681 Private; never forward raw VNC 5901. No container rebuild or new npm dependency is introduced. Existing desktop-lite and the managed Discord installation must already work.

Open the printed URL, unlock the engine, add Discord in UB Store, then open it. Enter the changed VNC password when requested. Verify the ACTIVE server password file, /usr/local/etc/vscode-dev-containers/vnc-passwd, was changed from the public default. Running vncpasswd without a filename can change a different home-directory file. The prompt refuses the literal default but cannot verify the server configuration. Never share passwords or session files.

Ready requires noVNC's connect event AND a visible X11 window with a Discord class and a PID belonging to the user's managed executable. It does not verify account sign-in, chat readiness, or a first video frame; a splash window can qualify. Timeout and Retry are provided. A minimized existing instance may need restoring through the explicitly unverified desktop-only view.

This is a privileged trusted-code-only preview: do not install untrusted HTML apps/scripts. Runtime/WebContainer pages and external website embedding are restricted. No arbitrary-command API, root launch, sandbox disabling, automatic installation or Codespace start/stop is added. Passwords/codes are not persisted in localStorage or URLs. Lock engine revokes this browser session; sessions expire after 30 minutes. Closing the viewer or pressing Ctrl+C does not stop Discord or Codespaces. Stop cloud compute through GitHub.

Automated tests cover helper logic and a mocked browser. Live GitHub authentication, X11 detection, TCP/WebSocket streaming, browser rendering, audio and microphone remain unverified. Treat this as a preview, not production-ready.
