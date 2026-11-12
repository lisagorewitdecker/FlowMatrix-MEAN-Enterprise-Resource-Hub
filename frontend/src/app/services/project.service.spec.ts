import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProjectService, ProjectStatus } from './project.service';

describe('ProjectService', () => {
	let service: ProjectService;
	let httpTesting: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()]
		});
		service = TestBed.inject(ProjectService);
		httpTesting = TestBed.inject(HttpTestingController);
	});

	afterEach(() => httpTesting.verify());

	it('gets projects with pagination and status filters', () => {
		service.getProjects({ page: 2, limit: 5, status: 'Active' }).subscribe();

		const request = httpTesting.expectOne((req) => req.url === '/api/projects');
		expect(request.request.method).toBe('GET');
		expect(request.request.params.get('page')).toBe('2');
		expect(request.request.params.get('limit')).toBe('5');
		expect(request.request.params.get('status')).toBe('Active');
		request.flush({ success: true, data: [], pagination: { total: 0, page: 2, pages: 0 } });
	});

	it('posts a new project', () => {
		const project = {
			title: 'Roadmap',
			description: 'Delivery plan',
			owner: 'owner-id',
			budget: 100,
			deadline: '2030-01-01'
		};
		service.createProject(project).subscribe();

		const request = httpTesting.expectOne('/api/projects');
		expect(request.request.method).toBe('POST');
		expect(request.request.body).toEqual(project);
		request.flush({ success: true, data: { ...project, _id: 'project-id', status: 'Planning', team: [] } });
	});

	it('patches a project status', () => {
		const status: ProjectStatus = 'Completed';
		service.updateStatus('project-id', status).subscribe();

		const request = httpTesting.expectOne('/api/projects/project-id/status');
		expect(request.request.method).toBe('PATCH');
		expect(request.request.body).toEqual({ status });
		request.flush({
			success: true,
			data: {
				_id: 'project-id',
				title: 'Roadmap',
				description: 'Delivery plan',
				status,
				owner: 'owner-id',
				team: [],
				budget: 100,
				deadline: '2030-01-01'
			}
		});
	});

	it('surfaces API errors to callers', () => {
		let receivedError: unknown;
		service.getProjects().subscribe({ error: (error: unknown) => receivedError = error });
		httpTesting.expectOne('/api/projects').flush('Unavailable', { status: 500, statusText: 'Server Error' });

		expect(receivedError).toBeInstanceOf(HttpErrorResponse);
	});
});