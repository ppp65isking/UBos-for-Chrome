# Integrated private Chrome and Discord preview

Port 7682 serves the actual UBos frontend on a private Codespaces origin. Its built-in **Browser** app streams real Google Chrome inside UBos; opening the app starts Chrome and closing its UBos window stops Chrome. Chrome is installed in the devcontainer image, and the private preview server starts with the Codespace. The preview still streams the shared Linux desktop, not an isolated application surface. The regular UBos website is unchanged, and browser data on this origin is separate.

After pulling main safely, rebuild the Codespace once so the devcontainer installs Google Chrome and applies the port configuration. Rebuilds can remove files and browser profiles outside `/workspaces`; back up important data first. After it reconnects:

```bash
node --test remote-runner/desktop-preview.test.mjs
```

On each Codespace start, `remote-runner/start.sh` starts both the terminal runner and the desktop preview. If GitHub CLI reports missing Codespaces authorization, run `gh auth login -s codespace` once in a Codespaces terminal and restart the preview using `bash remote-runner/desktop-preview-start.sh`. The preview enforces port 7682 Private before binding and prints its URL and temporary engine code to the private runtime log at `${XDG_RUNTIME_DIR:-/tmp}/ubos-remote-$UID/desktop-preview.log`. Open the port-7682 URL and unlock it with that code. Never make port 7682 Public. Keep ports 6080 and 7681 Private too; never forward raw VNC port 5901.

Open **Browser** in UBos to start embedded Chrome. Chrome's profile and sign-in data are stored under `~/.local/share/ubos/chrome-profile` in the Codespace home directory. Closing the Browser window stops Chrome but keeps that profile while the Codespace storage remains. Closing the whole preview session or stopping the Codespace also stops Chrome; closing UBos does not stop Codespaces compute.

To use Discord, add it in UB Store and open its launcher. Enter the changed VNC password when requested. Verify the active server password file `/usr/local/etc/vscode-dev-containers/vnc-passwd` was changed from the public default. Running `vncpasswd` without a filename can change a different home-directory file. The prompt refuses the literal default but cannot verify the server configuration. Never share passwords or session files.

The browser view uses the authenticated, same-origin noVNC stream and starts Chrome with its sandbox enabled; it does not expose a command API or turn arbitrary websites into trusted UBos content. The shared desktop may show other running Linux windows. Keep ports private and do not install untrusted HTML apps or scripts. Passwords and connection codes are not stored in URLs or local storage. Locking the engine revokes the browser session; sessions expire after 30 minutes. Stop Codespaces compute through GitHub when finished.

The tests cover helper logic and a mocked browser lifecycle. A live Codespace rebuild, GitHub private-port authentication, X11/Chrome streaming, and Discord/audio/microphone behavior still require verification. Treat this as a preview, not production-ready.
