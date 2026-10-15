import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import pty from 'node-pty';
import { WebSocketServer, WebSocket } from 'ws';
import { codespaceOrigin, sameOrigin, equalSecret, cookieValue, sizeOf } from './security.mjs';

if (process.env.CODESPACES !== 'true') throw new Error('This personal beta only starts inside GitHub Codespaces.');
const origin = codespaceOrigin(process.env.CODESPACE_NAME, process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN);
try {
  execFileSync('gh', ['codespace', 'ports', 'visibility', '7681:private', '--codespace', process.env.CODESPACE_NAME], { timeout: 20000, stdio: 'pipe' });
} catch {
  console.error('Private-port setup failed. In Codespaces PORTS, forward port 7681 and keep Visibility Private, then retry npm start. If it still fails, report the error; do not make the port public. GitHub CLI needs permission to manage your Codespace ports.');
  process.exit(1);
}
const code = randomBytes(32).toString('base64url'), sessions = new Map(), TTL = 30 * 60 * 1000;
let terminal = null, transcript = '', detachedTimer = null, failures = 0, attemptWindow = Date.now();
const routes = new Map([
  ['/', ['public/index.html', 'text/html; charset=utf-8']],
  ['/client.js', ['public/client.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['public/style.css', 'text/css; charset=utf-8']],
  ['/vendor/xterm.js', ['node_modules/@xterm/xterm/lib/xterm.js', 'text/javascript; charset=utf-8']],
  ['/vendor/xterm.css', ['node_modules/@xterm/xterm/css/xterm.css', 'text/css; charset=utf-8']],
  ['/vendor/fit.js', ['node_modules/@xterm/addon-fit/lib/addon-fit.js', 'text/javascript; charset=utf-8']]
]);
function headers(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
}
function reply(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); }
function session(req) {
  const id = cookieValue(req.headers.cookie, 'ubos_session');
  if ((sessions.get(id) || 0) <= Date.now()) { sessions.delete(id); return ''; }
  return id;
}
async function jsonBody(req) {
  if (!String(req.headers['content-type']).startsWith('application/json')) throw new Error('JSON required');
  let body = '';
  for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 2048) throw new Error('Body too large'); }
  return JSON.parse(body);
}
function send(socket, message) {
  if (socket.readyState !== WebSocket.OPEN) return;
  if (socket.bufferedAmount > 1048576) { socket.close(1013, 'Output backpressure'); return; }
  socket.send(JSON.stringify(message));
}
function stopShell() {
  clearTimeout(detachedTimer); detachedTimer = null;
  const old = terminal; terminal = null; transcript = '';
  try { old?.kill(); } catch {}
}
const server = http.createServer(async (req, res) => {
  headers(res);
  if (req.headers.host !== new URL(origin).host && req.headers.host !== '127.0.0.1:7681' && req.headers.host !== 'localhost:7681') { reply(res, 403, { error: 'Host rejected' }); return; }
  try {
    const url = new URL(req.url, origin);
    if (url.search) { reply(res, 400, { error: 'Query parameters are not accepted' }); return; }
    if (req.method === 'GET' && url.pathname === '/api/status') { reply(res, 200, { authenticated: !!session(req) }); return; }
    if (req.method === 'POST') {
      if (!sameOrigin(req.headers.origin, origin)) { reply(res, 403, { error: 'Origin rejected' }); return; }
      if (url.pathname === '/api/login') {
        if (Date.now() - attemptWindow > 60000) { failures = 0; attemptWindow = Date.now(); }
        if (failures >= 5) { reply(res, 429, { error: 'Wait one minute before retrying' }); return; }
        const body = await jsonBody(req);
        if (!equalSecret(body.code, code)) { failures++; reply(res, 401, { error: 'Invalid connection code' }); return; }
        failures = 0;
        for (const [id, expires] of sessions) if (expires <= Date.now()) sessions.delete(id);
        if (sessions.size >= 4) sessions.delete(sessions.keys().next().value);
        const id = randomBytes(32).toString('base64url'); sessions.set(id, Date.now() + TTL);
        res.setHeader('Set-Cookie', `ubos_session=${id}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800`);
        reply(res, 200, { ok: true }); return;
      }
      if (url.pathname === '/api/logout' && session(req)) {
        const id = session(req); sessions.delete(id);
        for (const client of wss.clients) if (client.session === id) client.close(1000, 'Logged out');
        stopShell(); res.setHeader('Set-Cookie', 'ubos_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
        reply(res, 200, { ok: true }); return;
      }
    }
    if (req.method === 'GET' && routes.has(url.pathname)) {
      const [path, type] = routes.get(url.pathname);
      const data = await readFile(new URL(path, import.meta.url));
      res.writeHead(200, { 'Content-Type': type }); res.end(data); return;
    }
    reply(res, 404, { error: 'Not found' });
  } catch { if (!res.headersSent) reply(res, 400, { error: 'Request failed' }); else res.end(); }
});
const wss = new WebSocketServer({ noServer: true, maxPayload: 20000, perMessageDeflate: false });
server.on('upgrade', (req, socket, head) => {
  const id = session(req);
  if (req.url !== '/ws' || !sameOrigin(req.headers.origin, origin) || !id) { socket.end('HTTP/1.1 403 Forbidden' + String.fromCharCode(13,10,13,10)); return; }
  if ([...wss.clients].some(c => c.readyState === WebSocket.OPEN)) { socket.end('HTTP/1.1 409 Conflict' + String.fromCharCode(13,10,13,10)); return; }
  wss.handleUpgrade(req, socket, head, ws => { ws.session = id; wss.emit('connection', ws); });
});
wss.on('connection', socket => {
  clearTimeout(detachedTimer); detachedTimer = null;
  if (!terminal) {
    transcript = '';
    try {
      terminal = pty.spawn('/bin/bash', ['--login'], { name: 'xterm-256color', cols: 80, rows: 24, cwd: fileURLToPath(new URL('../', import.meta.url)), env: { ...process.env, TERM: 'xterm-256color' } });
      const current = terminal;
      terminal.onData(data => { if (terminal !== current) return; transcript = (transcript + data).slice(-262144); for (const client of wss.clients) send(client, { type: 'output', data }); });
      terminal.onExit(event => { if (terminal !== current) return; terminal = null; for (const client of wss.clients) { send(client, { type: 'exit', code: event.exitCode }); client.close(1000, 'Shell exited'); } });
    } catch { send(socket, { type: 'error', message: 'Could not start shell' }); socket.close(1011, 'Shell startup failed'); return; }
  }
  send(socket, { type: 'ready' });
  if (transcript) send(socket, { type: 'output', data: transcript });
  socket.on('message', raw => {
    if (!sessions.has(socket.session) || sessions.get(socket.session) <= Date.now()) { socket.close(4401, 'Sign in again'); return; }
    try {
      const message = JSON.parse(raw.toString());
      if (message.type === 'input' && typeof message.data === 'string' && message.data.length <= 16384) terminal?.write(message.data);
      else if (message.type === 'resize' && sizeOf(message)) { const size = sizeOf(message); terminal?.resize(size.cols, size.rows); }
      else socket.close(1008, 'Invalid terminal message');
    } catch { socket.close(1008, 'Invalid terminal message'); }
  });
  socket.on('error', () => {});
  socket.on('close', () => { if (![...wss.clients].some(c => c.readyState === WebSocket.OPEN)) { clearTimeout(detachedTimer); detachedTimer = setTimeout(stopShell, 60000); } });
});
const expiry = setInterval(() => {
  for (const [id, expires] of sessions) if (expires <= Date.now()) { sessions.delete(id); for (const client of wss.clients) if (client.session === id) client.close(4401, 'Sign in again'); }
}, 15000);
function shutdown() { clearInterval(expiry); stopShell(); for (const client of wss.clients) client.close(1012, 'Server stopping'); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 2000).unref(); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
server.listen(7681, '127.0.0.1', () => {
  console.log('UBos Remote Terminal Beta — personal Codespace only.');
  console.log('Open: ' + origin + '/');
  console.log('Connection code (keep private; never commit or share): ' + code);
  console.log('Port 7681 was set Private. Do not change it to Public. Ctrl+C stops the server.');
});
server.on('error', error => { console.error('Server failed: ' + error.message); clearInterval(expiry); process.exit(1); });
