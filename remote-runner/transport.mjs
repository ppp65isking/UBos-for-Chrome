import { randomBytes } from 'node:crypto';
import { sameOrigin, equalSecret } from './security.mjs';
export function createTransportGuard(expected, now = Date.now) {
  const csrf = randomBytes(32).toString('base64url'), tickets = new Map();
  function acceptsOrigin(value) { return value === 'http://localhost:7681' || sameOrigin(value, expected); }
  function acceptsPost(headers) { return acceptsOrigin(headers.origin) && equalSecret(headers['x-ubos-csrf'], csrf); }
  function issueTicket(session) {
    if (!session) throw new Error('Authentication required');
    for (const [token, entry] of tickets) if (entry.expires <= now()) tickets.delete(token);
    if (tickets.size >= 16) throw new Error('Too many pending connections');
    const token = randomBytes(32).toString('base64url'); tickets.set(token, { session, expires: now() + 30000 }); return token;
  }
  function consumeTicket(protocols, session) {
    if (typeof protocols !== 'string' || !session || protocols.length > 512) return false;
    const values = protocols.split(',').map(value => value.trim());
    if (!values.includes('ubos-terminal')) return false;
    const tokens = values.filter(value => value.startsWith('ticket.'));
    if (tokens.length !== 1) return false;
    const token = tokens[0].slice(7), entry = tickets.get(token);
    if (!entry || entry.expires <= now() || entry.session !== session) return false;
    tickets.delete(token); return true;
  }
  return { acceptsOrigin, acceptsPost, issueTicket, consumeTicket, csrfToken: () => csrf };
}
