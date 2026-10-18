# Cloud Linux desktop preview: first test

This uses the Dev Containers desktop-lite feature, Fluxbox and noVNC. The desktop remains available directly on private port 6080; the authenticated UBos preview on private port 7682 embeds real Chrome in the built-in Browser app. Chrome is installed by the devcontainer Dockerfile, and its profile is saved in the ignored `.ubos/chrome-profile` workspace directory. Installation, Discord startup and media have not been live-tested for this repository.

## Before rebuilding

Save your work. GitHub documents that rebuilds preserve /workspaces but clear changes outside it. UBos-managed app installations under ~/.local/share/ubos/apps and vendor login/configuration data may need reinstalling or signing in again. Securely back up anything important outside /workspaces first; never commit account tokens or credential backups to this repository. Do not rebuild while an AI task or other remote job is running.

## Steps after this commit is on main

1. Open your existing UBos Codespace in the browser. Use its VS Code terminal, not the local Terminal app inside UBos. Start a fresh Bash terminal at the repository root.
2. Run git status. If there are changes you do not recognize or need to keep, stop and resolve them without deleting them. When safe, run git pull --ff-only origin main. If it fails, stop and inspect the error; do not force reset.
3. After backing up important data, press Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac), type Rebuild, and choose Codespaces: Rebuild Container, then Rebuild. Wait for it to reconnect. If it enters recovery mode, inspect the creation log instead of repeating the rebuild blindly.
4. Open a fresh Codespaces Bash terminal at the repository root. Run vncpasswd to replace desktop-lite's publicly documented default VNC password (vscode). Choose a separate password that is not your GitHub or Discord password. Do not paste it into chat or source files. If password setup fails, stop before signing in to Discord.
5. Open the Ports panel. Confirm ports 6080, 7681 and 7682 are Private before opening them in the browser. Do not forward raw VNC port 5901; remove any existing forwarding for it. Do not switch a port to Public to troubleshoot access.
6. Use Open in Browser for port 6080. If the root shows a directory rather than a Connect screen, open /vnc.html on that same private forwarded origin. Sign in to GitHub if prompted, then connect with the VNC password you chose. Keep passwords and connection codes private.
7. Back in the fresh Codespaces terminal, run these commands from the repository root:

```bash
bash remote-runner/discord.sh install
bash remote-runner/discord.sh status
bash remote-runner/discord.sh run
```

The desktop feature sets DISPLAY=:1. Discord should open on the browser desktop if its dependencies and sandbox are supported. This is a test, not a verified success. Do not run it as root or disable its sandbox. If startup fails, share only the relevant error lines, not credentials or private logs. Package installation can succeed even if launch fails.

8. First verify the login screen renders. Only then sign in yourself and test text chat. Audio, microphone, video and screen sharing remain unverified. The website's UB Store is not yet connected to this desktop.
9. When finished, stop the Codespace through GitHub. Closing the browser tab or Discord does not automatically stop cloud compute.

## Sources

- Feature: https://github.com/devcontainers/features/tree/main/src/desktop-lite
- Rebuild steps: https://docs.github.com/en/codespaces/developing-in-a-codespace/rebuilding-the-container-in-a-codespace
- Rebuild persistence warning: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers
- Private forwarding: https://docs.github.com/en/codespaces/developing-in-a-codespace/forwarding-ports-in-your-codespace
