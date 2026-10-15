# UBos Terminal 1.7

This is a browser-based virtual shell, not a host-system shell. It uses the existing UBos IndexedDB file database and does not run Node.js, npm, native executables or arbitrary shell scripts. Notes remain managed by the Notes app; terminal file commands operate on the virtual file database.

## Permissions

Settings > Developer separately enables Terminal HTTPS requests and experimental app installation. Both default to disabled. Requests omit credentials, require HTTPS, reject redirects/custom ports/literal IPs/local hostnames, have a 20-second timeout and a 2 MB response cap, and still require server CORS permission. This is not a guarantee that DNS resolves only to public IPs. Do not use it as a security boundary for untrusted code. No GitHub tokens from the chat connector are exposed.

## Clone

`clone owner/repo [destination] [branch]` downloads a public GitHub file snapshot to a new folder in Home. It is not a full Git clone: there is no .git directory, history, push/pull, symlink support or submodule checkout. The default branch is resolved through GitHub's public API. Limits: 40 regular files, 8 MB total, and roughly 1.4 MB per source file. Large/truncated trees abort; all downloaded files are staged in memory before one database transaction. GitHub unauthenticated rate limits and browser storage quotas apply.

## Installs (unstable)

`install /repo/index.html MyApp` copies one self-contained HTML file under 1 MB into the installed-app collection. It appears on the desktop and in launcher search. Relative assets and build-system projects are not bundled. Each install requires the developer permission and an explicit in-app confirmation. Installed code runs in an iframe with `sandbox=allow-scripts`, without allow-same-origin, popups, forms or top-level navigation. CSP restricts subresources, connections and nested frames. This does not make arbitrary code harmless or prevent it consuming resources; do not install secrets or untrusted code. A sandboxed document can still navigate its own frame. It receives no Terminal bridge or direct UBos storage access.

Use `apps` to find installed IDs and `open app-id` to launch. Installed app records are ordinary Blob-backed files with an app flag, preserving backup compatibility.

## Examples

```text
mkdir demo
write demo/hello.txt "Hello UBos"
cat demo/hello.txt
ls /
permissions
clone owner/small-repo
install /small-repo/index.html MyApp
apps
```

No deployment or browser-test results are implied by adding these files.
