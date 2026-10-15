'use strict';
const $ = selector => document.querySelector(selector), term = new Terminal({ cursorBlink: true, fontSize: 14, scrollback: 4000, theme: { background: '#101827', foreground: '#e2ecff' } }), fit = new FitAddon.FitAddon();
let socket = null;
term.loadAddon(fit); term.open($('#terminal'));
term.parser.registerOscHandler(52, () => true);
function resize() { fit.fit(); if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'resize', cols: Math.min(240, Math.max(20, term.cols)), rows: Math.min(100, Math.max(5, term.rows)) })); }
new ResizeObserver(resize).observe($('#terminal'));
function status(text) { $('#status').textContent = text; }
function unlocked(value) { $('#login').hidden = value; $('#connect').disabled = !value; $('#logout').disabled = !value; }
term.onData(data => { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'input', data })); });
term.onResize(() => { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'resize', cols: Math.min(240, Math.max(20, term.cols)), rows: Math.min(100, Math.max(5, term.rows)) })); });
async function request(path, body) {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(body) });
  const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Request failed'); return result;
}
$('#auth').onsubmit = async event => {
  event.preventDefault();
  try { const code = $('#code').value.trim(); $('#code').value = ''; await request('/api/login', { code }); unlocked(true); status('Unlocked. Click Start shell.'); } catch (error) { status(error.message); }
};
$('#connect').onclick = () => {
  if (socket && [WebSocket.CONNECTING, WebSocket.OPEN].includes(socket.readyState)) return;
  status('Connecting…'); $('#connect').disabled = true;
  socket = new WebSocket('wss://' + location.host + '/ws');
  socket.onopen = () => { term.reset(); resize(); term.focus(); status('Connected to Codespaces'); };
  socket.onmessage = event => { try { const message = JSON.parse(event.data); if (message.type === 'output') term.write(message.data); else if (message.type === 'exit') status('Shell exited: ' + message.code); else if (message.type === 'error') status(message.message); } catch { status('Invalid server response'); } };
  socket.onerror = () => status('Connection failed. Check private-port login and server status.');
  socket.onclose = event => { socket = null; $('#connect').disabled = false; if (event.code === 4401) { unlocked(false); status('Session expired. Unlock again.'); } else status('Disconnected. Reconnect within 60 seconds to retain the shell; a later connection starts a new shell.'); };
};
$('#logout').onclick = async () => { try { await request('/api/logout', {}); socket?.close(); unlocked(false); status('Locked; shell stopped.'); } catch (error) { status(error.message); } };
fetch('/api/status', { credentials: 'same-origin' }).then(r => r.json()).then(result => { unlocked(result.authenticated); if (result.authenticated) status('Unlocked. Click Start shell.'); }).catch(() => status('Server unavailable'));
window.addEventListener('pagehide', () => socket?.close());
