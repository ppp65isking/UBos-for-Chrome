# Experimental GitHub Pages Node/npm runner

Open runtime/index.html directly in its own browser tab on the existing UBos GitHub Pages site. Nothing registers on the main desktop, and this does not add the runtime inside the existing Terminal window.

1. Review and consent to the runtime-scoped isolation worker, then choose Enable isolation. The page may reload up to twice per attempt.
2. Check secureContext, crossOriginIsolated and SharedArrayBuffer. If they fail, stop: startup is not supported in that environment.
3. Review third-party network consent, then choose Start Node/npm. This imports @webcontainer/api 1.5.0 from esm.sh and attempts a real WebContainer boot. The CDN/module load and runtime compatibility have not been verified in a live browser here.
4. Run node --version, npm --version and node main.js. Output and exit codes come from actual spawned processes, not simulated responses.
5. Edit/save main.js or package.json, then try a trusted JavaScript package with npm install package-name --ignore-scripts. No package is automatically installed.

Only one node/npm process is exposed at a time. There is no interactive stdin or shell command parser. npm lifecycle scripts default to disabled through npm_config_ignore_scripts=true; do not treat this as a security sandbox for arbitrary malicious packages. Native add-ons are generally unsupported. WebContainer usage terms apply, including commercial licensing requirements where applicable; no key or paid service has been purchased or configured.

The runtime filesystem is temporary and separate from UBos IndexedDB. Download important editor content before reload/shutdown. Runtime requests are controlled by this page's own consent, not the old virtual Terminal switch. Revoking runtime consent tears down the runtime; it does not undo earlier network requests.

The bundled coi-serviceworker is upstream version 0.1.7 with MIT attribution. Its default scope is this runtime folder. It augments response headers for isolation; it does not proxy around school filters or disable extensions. No worker is registered without consent, except resuming a consented attempt after a page reload within the same session. The Remove button unregisters only a matching runtime worker. Close runtime tabs after removal to release their current controller. Existing server headers on Netlify/Cloudflare can still provide isolation after worker removal.

This is an experimental implementation, not a tested deployment. Blocked runtime/CDN resources, service-worker policy, unsupported browsers or startup errors can prevent it from functioning. No filter-circumvention steps are provided.

Sources:
- https://github.com/gzuidhof/coi-serviceworker
- https://webcontainers.io/guides/quickstart
- https://webcontainers.io/api
- https://webcontainers.io/guides/troubleshooting

Other v1.8 features (Tools, Gaming Hub redesign, Dino Runner, achievements and individual game apps) are not part of this runtime test.
