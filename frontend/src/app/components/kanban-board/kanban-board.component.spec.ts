import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { Project, ProjectStatus } from '../../services/project.service';
import { KanbanBoardComponent } from './kanban-board.component';

describe('KanbanBoardComponent', () => {
	let fixture: ComponentFixture<KanbanBoardComponent>;

	const project: Project = {
		_id: 'project-1',
		title: 'Roadmap',
		description: 'Delivery plan',
		status: 'Planning',
		owner: 'owner-1',
		team: [],
		budget: 1200,
		deadline: '2030-01-01'
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({ imports: [KanbanBoardComponent] }).compileComponents();
		fixture = TestBed.createComponent(KanbanBoardComponent);
		fixture.componentRef.setInput('projects', [project]);
		fixture.detectChanges();
	});

	it('groups projects under all four statuses', () => {
		const columns = fixture.debugElement.queryAll(By.css('.kanban-column'));
		const text = (fixture.nativeElement as HTMLElement).textContent;

		expect(columns).toHaveLength(4);
		expect(text).toContain('Planning');
		expect(text).toContain('Active');
		expect(text).toContain('Completed');
		expect(text).toContain('On-Hold');
		expect(text).toContain('Roadmap');
	});

	it('emits a status change from the accessible selector without mutating its input', () => {
		const emit = vi.spyOn(fixture.componentInstance.statusChange, 'emit');
		const selector = fixture.nativeElement.querySelector('select[aria-label="Status for Roadmap"]') as HTMLSelectElement;

		expect(selector).not.toBeNull();
		selector.value = 'Active';
		selector.dispatchEvent(new Event('change'));

		expect(emit).toHaveBeenCalledWith({ project, newStatus: 'Active' });
		expect(project.status).toBe('Planning');
	});

	it('emits cross-column drops and ignores drops into the same status', () => {
		const emit = vi.spyOn(fixture.componentInstance.statusChange, 'emit');
		const makeDrop = (source: ProjectStatus, target: ProjectStatus) => ({
			previousContainer: { data: source },
			container: { data: target },
			item: { data: project }
		} as unknown as CdkDragDrop<ProjectStatus, ProjectStatus, Project>);

		fixture.componentInstance.onDrop(makeDrop('Planning', 'Active'));
		expect(emit).toHaveBeenCalledWith({ project, newStatus: 'Active' });

		emit.mockClear();
		fixture.componentInstance.onDrop(makeDrop('Planning', 'Planning'));
		expect(emit).not.toHaveBeenCalled();
		expect(project.status).toBe('Planning');
	});
});