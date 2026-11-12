import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { startServer } from '../server';

describe('API server configuration', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		restoreEnvironment('MONGODB_URI', originalEnvironment.MONGODB_URI);
		restoreEnvironment('PORT', originalEnvironment.PORT);
	});

	const originalEnvironment = {
		MONGODB_URI: process.env.MONGODB_URI,
		PORT: process.env.PORT
	};

	function restoreEnvironment(name: string, value: string | undefined) {
		if (value === undefined) {
			delete process.env[name];
		} else {
			process.env[name] = value;
		}
	}

	it('starts the compiled server entry point through the npm script', () => {
		const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
			scripts: { start: string };
		};
		const compiledServer = resolve(process.cwd(), 'dist/server.js');

		expect(packageJson.scripts.start).toBe('node dist/server.js');
		expect(existsSync(compiledServer)).toBe(true);

		const result = spawnSync('npm', ['start'], {
			cwd: process.cwd(),
			env: { ...process.env, MONGODB_URI: '', PORT: '5000' },
			encoding: 'utf8',
			timeout: 10_000
		});

		expect(result.error).toBeUndefined();
		expect(result.status).toBe(1);
		expect(`${result.stdout}\n${result.stderr}`).toContain('MONGODB_URI environment variable is required.');
	});

	it('requires a MongoDB connection string before connecting', async () => {
		process.env.MONGODB_URI = '';
		const connect = jest.spyOn(mongoose, 'connect');

		await expect(startServer()).rejects.toThrow('MONGODB_URI environment variable is required.');
		expect(connect).not.toHaveBeenCalled();
	});

	it('rejects a port outside the valid range before connecting', async () => {
		process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
		process.env.PORT = '65536';
		const connect = jest.spyOn(mongoose, 'connect');

		await expect(startServer()).rejects.toThrow('PORT must be an integer between 1 and 65535.');
		expect(connect).not.toHaveBeenCalled();
	});

	it('surfaces MongoDB connection failures without starting the listener', async () => {
		const uri = 'mongodb://127.0.0.1:27017/test';
		const connectionError = new Error('database unavailable');
		process.env.MONGODB_URI = uri;
		process.env.PORT = '5000';
		const connect = jest.spyOn(mongoose, 'connect').mockRejectedValue(connectionError);

		await expect(startServer()).rejects.toBe(connectionError);
		expect(connect).toHaveBeenCalledWith(uri);
	});
});