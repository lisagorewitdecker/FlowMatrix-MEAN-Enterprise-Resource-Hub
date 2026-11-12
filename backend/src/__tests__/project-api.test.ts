import { describe, expect, it } from '@jest/globals';
import type { AddressInfo } from 'node:net';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { Project } from '../models/Project.model';
import { User } from '../models/User.model';

describe('project API setup', () => {
	const accessToken = jwt.sign({ userId: 'user-id', role: 'Manager' }, process.env.JWT_ACCESS_SECRET || 'access_secret');
	it('registers User references and validates project fields', async () => {
		expect(mongoose.modelNames()).toContain('User');
		expect(mongoose.modelNames()).toContain('Project');
		await expect(new User({ name: 'Test User', email: 'test@example.com', passwordHash: 'hash' }).validate()).resolves.toBeUndefined();

		await expect(new Project({ title: '', budget: -1 }).validate()).rejects.toMatchObject({
			errors: {
				title: expect.anything(),
				owner: expect.anything(),
				budget: expect.anything()
			}
		});
	});

	it('mounts project routes and rejects invalid input without MongoDB', async () => {
		const server = createApp().listen(0);

		try {
			await new Promise<void>((resolve, reject) => {
				server.once('listening', resolve).once('error', reject);
			});
			const address = server.address() as AddressInfo;
			const response = await fetch(`http://127.0.0.1:${address.port}/api/projects`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
				body: JSON.stringify({})
			});
			const body = await response.json() as { success: boolean; message: string };

			expect(response.status).toBe(400);
			expect(body.success).toBe(false);
			expect(body.message).toBe('Invalid Project Data');
		} finally {
			await new Promise<void>((resolve, reject) => {
				server.close((error) => error ? reject(error) : resolve());
			});
		}
	});
});
