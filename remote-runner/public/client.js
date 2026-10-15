'use strict';
const $ = selector => document.querySelector(selector), term = new Terminal({ cursorBlink: true, fontSize: 14, scrollback: 4000, theme: { background: '#101827', foreground: '#e2ecff' } }), fit = new FitAddon.FitAddon();
let socket = null, authenticated = false, csrf = '', connecting = false;
term.loadAddon(fit); term.open($('#terminal')); term.parser.registerOscHandler(52, () => true);
function dimensions() { return { type: 'resize', cols: Math.min(240, Math.max(20, term.cols)), rows: Math.min(100, Math.max(5, term.rows)) }; }
function resize() { fit.fit(); if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(dimensions())); }
new ResizeObserver(resize).observe($('#terminal'));
function status(text) { $('#status').textContent = text; }
function unlocked(value) { authenticated = value; $('#login').hidden = value; $('#connect').disabled = !value || connecting; $('#logout').disabled = !value; }
term.onData(data => { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'input', data })); });
term.onResize(() => { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(dimensions())); });
const bootstrap = fetch('/api/bootstrap', { credentials: 'same-origin', cache: 'no-store' }).then(async response => {
  if (!response.ok) throw new Error('Bootstrap failed'); const result = await response.json();
  if (typeof result.csrfToken !== 'string' || !result.csrfToken) throw new Error('Missing request verification');
  csrf = result.csrfToken; unlocked(result.authenticated); status(result.authenticated ? 'Unlocked. Click Start shell.' : 'Enter the connection code.'); return true;
}).catch(() => { status('Reload this page after restarting the updated server.'); return false; });
async function request(path, body) {
  if (!await bootstrap) throw new Error('Reload the updated terminal page first.');
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-UBos-CSRF': csrf }, credentials: 'same-origin', body: JSON.stringify(body) });
  const result = await response.json(); if (!response.ok) { const error = new Error(result.error || 'Request failed'); error.status = response.status; throw error; } return result;
}
$('#auth').onsubmit = async event => {
  event.preventDefault(); try { const code = $('#code').value.trim(); $('#code').value = ''; await request('/api/login', { code }); unlocked(true); status('Unlocked. Click Start shell.'); } catch (error) { status(error.message); }
};
$('#connect').onclick = async () => {
  if (connecting || socket && [WebSocket.CONNECTING, WebSocket.OPEN].includes(socket.readyState)) return;
  connecting = true; unlocked(authenticated); status('Connecting…');
  try {
    const result = await request('/api/ticket', {});
    socket = new WebSocket('wss://' + location.host + '/ws', ['ubos-terminal', 'ticket.' + result.ticket]);
    socket.onopen = () => { connecting = false; term.reset(); resize(); term.focus(); status('Connected to Codespaces'); };
    socket.onmessage = event => { try { const message = JSON.parse(event.data); if (message.type === 'output') term.write(message.data); else if (message.type === 'exit') status('Shell exited: ' + message.code); else if (message.type === 'error') status(message.message); } catch { status('Invalid server response'); } };
    socket.onerror = () => status('Connection failed. Check private-port login and server status.');
    socket.onclose = event => { socket = null; connecting = false; if (event.code === 4401) { unlocked(false); status('Session expired. Unlock again.'); } else { unlocked(authenticated); status(authenticated ? 'Disconnected. Reconnect within 60 seconds to retain the shell.' : 'Locked; shell stopped.'); } };
  } catch (error) { connecting = false; unlocked(error.status === 401 ? false : authenticated); status(error.message); }
};
$('#logout').onclick = async () => { try { await request('/api/logout', {}); unlocked(false); socket?.close(); status('Locked; shell stopped.'); } catch (error) { status(error.message); } };
window.addEventListener('pagehide', () => socket?.close());
