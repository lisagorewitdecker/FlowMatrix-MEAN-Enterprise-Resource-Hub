import { describe, expect, it } from '@jest/globals';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';

describe('authentication routes', () => {
  it('mounts the login route and validates missing credentials', async () => {
    const server = createApp().listen(0);

    try {
      await new Promise<void>((resolve, reject) => {
        server.once('listening', resolve).once('error', reject);
      });

      const address = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        success: false,
        message: 'Email and password are required.'
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
  });
});
