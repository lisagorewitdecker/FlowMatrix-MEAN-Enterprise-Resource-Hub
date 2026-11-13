import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { Project } from '../models/Project.model';
import { activityEmitter } from '../routes/activity.routes';

const accessToken = jwt.sign({ userId: 'user-id', role: 'Manager' }, process.env.JWT_ACCESS_SECRET || 'access_secret');
const authHeaders = { Authorization: `Bearer ${accessToken}` };

async function withServer(run: (baseUrl: string) => Promise<void>) {
	const server = createApp().listen(0);

	try {
		await new Promise<void>((resolve, reject) => {
			server.once('listening', resolve).once('error', reject);
		});

		const address = server.address() as AddressInfo;
		await run(`http://127.0.0.1:${address.port}`);
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => error ? reject(error) : resolve());
		});
	}
}

describe('project routes', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('returns projects with default pagination', async () => {
		const projects = [{ title: 'Roadmap' }];
		const query = {
			populate: jest.fn().mockReturnThis(),
			skip: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
 		sort: jest.fn().mockResolvedValue(projects as never)
		};
		const find = jest.spyOn(Project, 'find').mockReturnValue(query as never);
		jest.spyOn(Project, 'countDocuments').mockResolvedValue(12 as never);

		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/projects`, { headers: authHeaders });
			const body = await response.json();

			expect(response.status).toBe(200);
			expect(body).toEqual({
				success: true,
				data: projects,
				pagination: { total: 12, page: 1, pages: 2 }
			});
		});

		expect(find).toHaveBeenCalledWith({} as never);
		expect(query.populate).toHaveBeenNthCalledWith(1, 'owner', 'name email');
		expect(query.populate).toHaveBeenNthCalledWith(2, 'team', 'name email');
		expect(query.skip).toHaveBeenCalledWith(0);
		expect(query.limit).toHaveBeenCalledWith(10);
		expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
	});

	it('applies status filtering and requested pagination', async () => {
		const projects = [{ title: 'Current project' }];
		const query = {
			populate: jest.fn().mockReturnThis(),
			skip: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
 		sort: jest.fn().mockResolvedValue(projects as never)
		};
		const find = jest.spyOn(Project, 'find').mockReturnValue(query as never);
		const countDocuments = jest.spyOn(Project, 'countDocuments').mockResolvedValue(6 as never);

		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/projects?page=2&limit=5&status=Active`, { headers: authHeaders });
			const body = await response.json();

			expect(response.status).toBe(200);
			expect(body).toEqual({
				success: true,
				data: projects,
				pagination: { total: 6, page: 2, pages: 2 }
			});
		});

		expect(find).toHaveBeenCalledWith({ status: 'Active' } as never);
		expect(countDocuments).toHaveBeenCalledWith({ status: 'Active' } as never);
		expect(query.skip).toHaveBeenCalledWith(5);
		expect(query.limit).toHaveBeenCalledWith(5);
	});

	it('creates a project and returns the saved document', async () => {
		const savedProject = { _id: 'project-id', title: 'Roadmap' };
		const save = jest.spyOn(Project.prototype, 'save').mockResolvedValue(savedProject as never);
		const emit = jest.spyOn(activityEmitter, 'emit');

		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/projects`, {
				method: 'POST',
				headers: { ...authHeaders, 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: 'Roadmap',
					description: 'Project plan',
					owner: '507f1f77bcf86cd799439011',
					budget: 100,
					deadline: '2030-01-01T00:00:00.000Z'
				})
			});
			const body = await response.json();

			expect(response.status).toBe(201);
			expect(body).toEqual({ success: true, data: savedProject });
		});

		expect(save).toHaveBeenCalledTimes(1);
		expect(emit).toHaveBeenCalledWith('projectActivity', expect.objectContaining({
			type: 'PROJECT_CREATED',
			title: savedProject.title,
			timestamp: expect.any(Date)
		}));
	});

	it('mounts the authenticated activity stream', async () => {
		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/activity/stream`);
			const body = await response.json();

			expect(response.status).toBe(401);
			expect(body).toMatchObject({ success: false, message: 'Access Denied: No Token Provided' });
		});
	});

	it('allows contributors to reach project creation validation', async () => {
	it('allows contributors to create projects', async () => {
		const contributorToken = jwt.sign(
			{ userId: 'user-id', role: 'Contributor' },
			process.env.JWT_ACCESS_SECRET || 'access_secret'
		);
		const savedProject = { _id: 'project-id', title: 'Roadmap' };
		const save = jest.spyOn(Project.prototype, 'save').mockResolvedValue(savedProject as never);

		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/projects`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${contributorToken}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Roadmap' })
			});
			const body = await response.json();

			expect(response.status).toBe(400);
			expect(body).toMatchObject({ success: false, message: 'Invalid Project Data' });
		});
				body: JSON.stringify({
					title: 'Roadmap',
					description: 'Project plan',
					owner: '507f1f77bcf86cd799439011',
					budget: 100,
					deadline: '2030-01-01T00:00:00.000Z'
				})
			});
			const body = await response.json();

			expect(response.status).toBe(201);
			expect(body).toEqual({ success: true, data: savedProject });
		});

		expect(save).toHaveBeenCalledTimes(1);
	});

	it('deletes a project for administrators', async () => {
		const adminToken = jwt.sign(
			{ userId: 'user-id', role: 'Admin' },
			process.env.JWT_ACCESS_SECRET || 'access_secret'
		);
		const deletedProject = { _id: 'project-id', title: 'Roadmap' };
		const findByIdAndDelete = jest.spyOn(Project, 'findByIdAndDelete').mockResolvedValue(deletedProject as never);

		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/projects/project-id`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${adminToken}` }
			});
			const body = await response.json();

			expect(response.status).toBe(200);
			expect(body).toEqual({ success: true, data: deletedProject });
		});

		expect(findByIdAndDelete).toHaveBeenCalledWith('project-id');
	});

	it('returns a server error when project lookup fails', async () => {
		const query = {
			populate: jest.fn().mockReturnThis(),
			skip: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
 		sort: jest.fn().mockRejectedValue(new Error('database unavailable') as never)
		};
		jest.spyOn(Project, 'find').mockReturnValue(query as never);

		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/projects`, { headers: authHeaders });
			const body = await response.json();

			expect(response.status).toBe(500);
			expect(body).toMatchObject({ success: false, message: 'Server Error' });
		});
	});

	it('returns the validation response when saving a project fails', async () => {
		jest.spyOn(Project.prototype, 'save').mockRejectedValue(new Error('database unavailable'));

		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/projects`, {
				method: 'POST',
				headers: { ...authHeaders, 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Roadmap' })
			});
			const body = await response.json();

			expect(response.status).toBe(400);
			expect(body).toMatchObject({ success: false, message: 'Invalid Project Data' });
		});
	});

	it('rejects project requests without a bearer token', async () => {
		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/projects`);
			const body = await response.json();

			expect(response.status).toBe(401);
			expect(body).toMatchObject({ success: false, message: 'Access Denied: No Token Provided' });
		});
	});

	it('returns 401 for expired access tokens so clients can refresh them', async () => {
		const expiredToken = jwt.sign(
			{ userId: 'user-id', role: 'Contributor', exp: Math.floor(Date.now() / 1000) - 60 },
			process.env.JWT_ACCESS_SECRET || 'access_secret'
		);

		await withServer(async (baseUrl) => {
			const response = await fetch(`${baseUrl}/api/projects`, {
				headers: { Authorization: `Bearer ${expiredToken}` }
			});

			expect(response.status).toBe(401);
		});
	});
});