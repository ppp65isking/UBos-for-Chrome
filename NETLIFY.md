# Try UBos on Netlify

This commit prepares hosting only. It does not deploy a site or implement the Node/npm beta, Tools, Gaming Hub, Dino Runner, achievements or individual game apps requested for v1.8.

## Connect the existing repository

1. Sign in to Netlify and import an existing Git project.
2. Choose GitHub and authorize access to ppp65isking/UBos-for-Chrome.
3. Select the main branch. For this static version, leave the build command empty and publish the repository root (.). netlify.toml also declares the publish directory.
4. Review Netlify's current plan limits and any usage charges, then deploy. No paid upgrade or purchase is authorized by this configuration.
5. Open the actual URL Netlify assigns; no production URL has been reserved or verified by this commit.
6. Open /runtime/index.html directly in a browser tab and review its diagnostic output. This page is not a Node runtime.

## Isolation scope

netlify.toml applies Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp only under /runtime. The normal UBos desktop is unchanged by these headers. The first runtime test should use a top-level tab. Embedding this area inside a non-isolated UBos desktop does not by itself create an isolated runtime; an in-desktop Node beta needs a separately designed and tested integration.

Passing secure-context, crossOriginIsolated and SharedArrayBuffer checks is necessary groundwork, not proof of WebContainer compatibility. No dependency has been installed or runtime booted here.

## Preserve local data

Before using the new domain, export a backup through the existing UBos Storage app. Local storage and IndexedDB are scoped to the origin; a different domain does not inherit the old site's data. Import the backup on the new site and verify notes/files before considering the move complete. Browser bookmarks, game scores and other local preferences may not all be included in the current backup format. Keep the original site and backup available.

## GitHub Pages

This does not remove GitHub Pages or create another repository. GitHub Pages does not read Netlify's configuration file. After a Git-connected Netlify deployment is configured, later pushes can trigger updates there.

## Sources

- https://webcontainers.io/guides/configuring-headers
- https://docs.netlify.com/build/configure-builds/file-based-configuration/
