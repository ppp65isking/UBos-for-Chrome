import test from 'node:test';
import assert from 'node:assert/strict';
import { codespaceOrigin, sameOrigin, equalSecret, cookieValue, sizeOf } from './security.mjs';
test('requires a supported Codespaces hostname',()=>{assert.equal(codespaceOrigin('demo-name','app.github.dev'),'https://demo-name-7681.app.github.dev');for(const name of ['', 'x/evil', 'a@b'])assert.throws(()=>codespaceOrigin(name,'app.github.dev'));assert.throws(()=>codespaceOrigin('demo','attacker.test'))});
test('rejects absent, lookalike and cross origins',()=>{const origin='https://demo-7681.app.github.dev';assert.equal(sameOrigin(origin,origin),true);for(const value of [undefined,'null',origin+'.attacker.test','http://demo-7681.app.github.dev'])assert.equal(sameOrigin(value,origin),false)});
test('connection-code comparison checks exact value',()=>{assert.equal(equalSecret('abc','abc'),true);for(const value of [null,'','abcd','ABC','x'.repeat(300)])assert.equal(equalSecret(value,'abc'),false)});
test('extracts only the intended cookie',()=>{assert.equal(cookieValue('other=x; ubos_session=abc; end=y','ubos_session'),'abc');assert.equal(cookieValue('evil_ubos_session=abc','ubos_session'),'');assert.equal(cookieValue(undefined,'ubos_session'),'')});
test('bounds terminal dimensions',()=>{assert.deepEqual(sizeOf({cols:80,rows:24}),{cols:80,rows:24});for(const value of [null,{cols:0,rows:24},{cols:80,rows:101},{cols:80.5,rows:24},{cols:'80',rows:24}])assert.equal(sizeOf(value),null)});
