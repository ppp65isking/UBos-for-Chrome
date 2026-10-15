# UBos 2.1: Discord Linux foundation

Status: implementation foundation, not a working browser-streamed Discord release.

The goal is to run the official Discord Linux desktop client in a cloud Linux session and use it through the UBos website. No extra personal PC is required. This commit only adds managed program-file installation, a launch command for an existing graphical session, a file-presence check, and removal. It does not create a graphical session or connect one to UBos.

## Use in your personal Codespace

Pull the updated main branch, then review and run these commands from the repository root in a fresh Bash shell:

```bash
bash remote-runner/discord.sh install
bash remote-runner/discord.sh status
# Only after a separate graphical Linux session has been configured:
bash remote-runner/discord.sh run
# Close Discord first; this prompts before deleting managed program files:
bash remote-runner/discord.sh uninstall
```

The helper targets Linux x86_64, refuses root, and requires curl plus Python with tarfile.data_filter for safe extraction. It downloads the stable archive from Discord's HTTPS download endpoint into a temporary directory and installs under ~/.local/share/ubos/apps/discord. It does not run vendor install scripts, install system libraries, change other Discord installations, or disable the Chromium sandbox. Downloading is not proof that launch succeeds. Missing libraries or sandbox restrictions may still prevent startup; keep and inspect the error rather than bypassing the sandbox.

Uninstall removes only the managed program files. It does not stop running processes or remove Discord account/session data. Sign out in Discord if needed, and treat persistent cloud storage as sensitive.

## Release gates still open

- Provision a graphical Linux session in the cloud and verify Discord launches with its sandbox enabled.
- Select and test a browser streaming transport; secure it with authentication and session isolation.
- Keep Codespaces forwarded ports Private. Do not expose a logged-in desktop publicly or store GitHub tokens in browser storage.
- Resolve private-port authentication and embedding before claiming an in-UBos app window works. Do not weaken the existing terminal runner's frame policy as a shortcut.
- Integrate the UB Store and launcher with real backend actions and verified installation/running/connection states. This commit does not add a Discord Store entry or pretend its install command is one-click remote installation.
- Test login, text chat, input, resize, reconnect, persistent sessions and close behavior.
- Design and test speaker audio, microphone forwarding, voice/video calls and screen sharing separately. A visible GUI is not proof of working calls.
- Define cloud resource limits, idle shutdown and billing safeguards. Existing runner startup does not wake a stopped Codespace.
- Verify and add authentic Codex and Claude Code artwork under the vendors' usage rules. No official icon assets are included in this foundation commit.

## Verification status

No live Codespace GUI, Discord login, audio, microphone, browser embedding, or installation test has been performed for this commit. Do not label UBos 2.1 complete based on these helper files.
