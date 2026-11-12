import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import test from 'node:test';

const application = { name: 'FlowMatrix', entry: '../../dist/frontend/server/server.mjs' };

test(`${application.name} SSR accepts local hosts and rejects untrusted hosts`, async () => {
  const { reqHandler } = await import(application.entry);
  const server = createServer(reqHandler);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const { port } = server.address();
    for (const host of ['localhost', '127.0.0.1']) {
      const response = await fetch(`http://${host}:${port}/login`);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, /FlowMatrix Login/);
      assert.doesNotMatch(html, /Hello, frontend/);
    }

    const status = await new Promise((resolve, reject) => {
      const req = request({ hostname: '127.0.0.1', port, headers: { host: 'untrusted.invalid' } }, (res) => {
        res.resume();
        resolve(res.statusCode);
      });
      req.on('error', reject);
      req.end();
    });
    assert.equal(status, 400);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});