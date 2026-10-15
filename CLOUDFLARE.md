# UBos on Cloudflare Pages

This prepares a legitimate alternative hosting target; it does not deploy a site, remove other hosts or change school filtering policies. A school block requires administrator review. Do not treat a new URL as authorization to bypass school policy.

## Git-connected static site

1. Sign in to Cloudflare. Open Workers & Pages, choose Create application, and select Pages / Import an existing Git repository. Select Pages, not a Worker deployment, for this guide. Dashboard wording may change.
2. Authorize GitHub access and select ppp65isking/UBos-for-Chrome.
3. Production branch: main. Framework preset: None. Build command: exit 0. Build output directory: . (the repository root containing index.html and _headers). Root directory: leave unset unless the dashboard requires it.
4. Review the current plan and usage limits before deploying. No paid upgrade or purchase is authorized by this configuration.
5. Save and deploy. Use the actual project URL Cloudflare provides; this commit does not reserve or verify a URL.
6. Open the UBos homepage, then open /runtime/ directly in its own Chrome tab. The existing runtime diagnostic page should display its prerequisite checks.

## Headers

Cloudflare Pages reads _headers from the published static asset directory. The committed rules apply COOP: same-origin and COEP: require-corp to /runtime and /runtime/* only. These rules are for static responses, not Pages Functions. The rest of UBos does not receive these isolation headers from this file.

The diagnostic page checks secure context, crossOriginIsolated and SharedArrayBuffer. A successful check is not a running Node/npm environment. WebContainer integration still needs implementation and testing. Isolation on a runtime iframe alone does not isolate a non-isolated desktop parent.

## Existing hosting and local data

netlify.toml and the previous hosting instructions remain in the repository. GitHub Pages and Netlify are not disabled. Cloudflare uses _headers, while Netlify-specific configuration remains separate.

Before changing origins, export a backup from the original UBos Storage app, import it on the new site and verify notes/files. Local storage and IndexedDB do not automatically move between domains. The existing backup may not include all browser preferences, bookmarks or game scores. Keep the original site and backup available.

## Remaining v1.8 work

Node/npm beta, Tools, Gaming Hub redesign, Dino Runner, achievements and individual game apps are not implemented by this hosting change.

## Official documentation

- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://webcontainers.io/guides/configuring-headers
