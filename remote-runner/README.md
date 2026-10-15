# UBos Remote Terminal Beta — personal Codespaces only

This adds a Node/node-pty/WebSocket Linux terminal plus an optional UBos launcher. It does not run a native binary inside WebContainers, automatically start a stopped Codespace, or turn Codespaces into free unlimited hosting. The UBos launcher opens the private terminal in a separate tab so GitHub authentication is top-level, not an iframe/cross-site cookie workaround.

## Start in your existing Codespaces terminal

Exit the interactive Codex UI first so you have a normal shell prompt. Then, from the repository root:

```bash
git status --short
git pull --ff-only
cd remote-runner
npm install
npm test
```

If git reports local edits or diverged history, stop rather than resetting or overwriting work. If node-pty cannot build, report the error; it can require Python, make and a C++ compiler. No dependencies or native modules were installed/tested by the repository connector.

In the Codespaces PORTS panel, forward port 7681 if it is not listed and keep Visibility Private. Then run:

```bash
npm start
```

Startup uses GitHub CLI to explicitly set port 7681 Private before binding the server. It fails closed if that command fails. If you lack GitHub CLI authorization, report the error instead of changing visibility to Public. Do not disable the private-port preflight. This controls the Codespaces forwarding setting, not a new hosting deployment.

The server prints an HTTPS URL and a random connection code. Open the URL in a new tab, complete GitHub's owner authentication if requested, enter the connection code there, then click Start shell. Never paste the code or any authentication files into chat, commit them, put them in a URL, or make port 7681 Public. A server restart invalidates the previous code/cookies.

In UBos, open Remote Terminal Beta, paste only the HTTPS URL ending in -7681.app.github.dev/, save it, then click Open private terminal. Existing UBos tabs need refreshing once to load the launcher update. Remote connection codes, Codex credentials and GitHub tokens are not saved by that launcher.

Test Codex from the remote browser terminal with:

```bash
npx --yes --package=@openai/codex codex --version
npx --yes --package=@openai/codex codex
```

Your existing Codex login may be available because this shell uses the same Codespace account. Do not log in again unless Codex requests it. AI-service billing/plan limits remain separate from Codespaces compute allowances.

## Boundaries and security

This is an owner-only development terminal, not a multi-user sandbox service. Commands have the same privileges and access to repository files, Codespaces environment variables and credentials as your normal Codespaces terminal. The connection code supplements GitHub private-port authentication; it does not isolate programs from the Codespace owner or other processes under that account. Never let untrusted people use it or run untrusted scripts. No public CORS execution API is provided.

The server binds loopback port 7681, serves only an explicit static-file allowlist, validates browser origins for login and WebSockets, uses random HttpOnly/Secure/SameSite cookies with 30-minute expiry, rate-limits failed code attempts, bounds messages/output/terminal dimensions, permits one live terminal connection, and retains disconnected shells for up to 60 seconds. Reconnect does not replay submitted commands; it can replay recent terminal output. After retention ends, a new connection starts a new shell. Detached/background processes can outlive a shell; stopping the Codespace is the final cleanup boundary. Locking stops the shell but does not stop Codespaces billing.

The runner stores no workspace backups. Work remains in the existing Codespace; keep project work backed up/committed appropriately, and do not delete the Codespace expecting uncommitted work or credentials to survive. Stopping the server with Ctrl+C does not stop the Codespace: stop it through GitHub when finished to conserve usage. No auto-start, launcher discovery for remotely installed packages, automatic backup restore, or public sharing is implemented in this beta.

## Validation

Before commit approval, JavaScript syntax and the five dependency-free security unit tests were checked locally. node-pty installation, GitHub private-port changes/authentication, WebSocket proxying, PTY input and Codex execution through this new page still require your live Codespaces test. The earlier successful Codex CLI run in Codespaces does not test this server integration.
