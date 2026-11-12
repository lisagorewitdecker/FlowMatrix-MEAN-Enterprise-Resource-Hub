import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { NEVER, of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProjectService, ProjectListResponse, ProjectResponse } from '../../services/project.service';
import { ProjectDashboardComponent } from './project-dashboard.component';

describe('ProjectDashboard', () => {
  let fixture: ComponentFixture<ProjectDashboardComponent>;
  let projectService: {
    getProjects: ReturnType<typeof vi.fn>;
    createProject: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let authService: { currentUser: ReturnType<typeof vi.fn> };

  const projectResponse: ProjectListResponse = {
    success: true,
    data: [{
      _id: 'project-1',
      title: 'Roadmap',
      description: 'Delivery plan',
      status: 'Active',
      owner: 'owner-1',
      team: [],
      budget: 1200,
      deadline: '2030-01-01'
    }],
    pagination: { total: 1, page: 1, pages: 1 }
  };

  beforeEach(async () => {
    projectService = {
      getProjects: vi.fn().mockReturnValue(of(projectResponse)),
      createProject: vi.fn(),
      updateStatus: vi.fn().mockReturnValue(of({ success: true, data: projectResponse.data[0] }))
    };
    authService = {
      currentUser: vi.fn().mockReturnValue({ id: 'owner-1', name: 'Owner', email: 'owner@example.com', role: 'user' })
    };

    await TestBed.configureTestingModule({
      imports: [ProjectDashboardComponent],
      providers: [
        { provide: ProjectService, useValue: projectService },
        { provide: AuthService, useValue: authService },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
      .compileComponents();

  });

  it('loads and displays projects from the project service', () => {
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();

    expect(projectService.getProjects).toHaveBeenCalledWith({ limit: 100 });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Roadmap');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Active');
  });

  it('shows a loading state while projects are pending', () => {
    projectService.getProjects.mockReturnValue(NEVER);
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading enterprise project index');
  });

  it('shows a useful error when projects cannot be loaded', () => {
    projectService.getProjects.mockReturnValue(throwError(() => new Error('offline')));
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Unable to retrieve enterprise project records');
  });

  it('clears the load error when a retry succeeds', () => {
    projectService.getProjects
      .mockReturnValueOnce(throwError(() => new Error('offline')))
      .mockReturnValueOnce(of(projectResponse));
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.fetchProjects();
    fixture.detectChanges();

    expect(component.error()).toBe('');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Roadmap');
  });

  it('does not request projects during server rendering', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();

    expect(projectService.getProjects).not.toHaveBeenCalled();
  });

  it('creates projects with the current user as owner', () => {
    projectService.createProject.mockReturnValue(of({ success: true, data: projectResponse.data[0] } satisfies ProjectResponse));
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const project = {
      title: 'New project',
      description: 'Project details',
      budget: 100,
      deadline: '2030-01-01',
      status: 'Planning'
    };
    component.toggleModal(true);
    component.projectForm.setValue(project);

    component.onCreateProject();

    expect(projectService.createProject).toHaveBeenCalledWith({ ...project, owner: 'owner-1' });
    expect(component.isModalOpen()).toBe(false);
    expect(projectService.getProjects).toHaveBeenCalledTimes(2);
  });

  it('shows an error and does not create a project when the user is unavailable', () => {
    authService.currentUser.mockReturnValue(null);
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.toggleModal(true);
    component.projectForm.setValue({
      title: 'New project',
      description: 'Project details',
      budget: 100,
      deadline: '2030-01-01',
      status: 'Planning'
    });

    component.onCreateProject();
    fixture.detectChanges();

    expect(projectService.createProject).not.toHaveBeenCalled();
    expect(component.isModalOpen()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Session invalid. Please re-authenticate.');
  });

  it('shows an API error without closing the modal or clearing the project form', () => {
    projectService.createProject.mockReturnValue(throwError(() => new Error('offline')));
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const project = {
      title: 'New project',
      description: 'Project details',
      budget: 100,
      deadline: '2030-01-01',
      status: 'Planning'
    };
    component.toggleModal(true);
    component.projectForm.setValue(project);

    component.onCreateProject();
    fixture.detectChanges();

    expect(component.isModalOpen()).toBe(true);
    expect(component.projectForm.value).toEqual(project);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Failed to create project.');
  });

  it('clears the creation error when the modal is reopened', () => {
    projectService.createProject.mockReturnValue(throwError(() => new Error('offline')));
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.toggleModal(true);
    component.projectForm.setValue({
      title: 'New project',
      description: 'Project details',
      budget: 100,
      deadline: '2030-01-01',
      status: 'Planning'
    });

    component.onCreateProject();
    component.toggleModal(false);
    component.toggleModal(true);
    fixture.detectChanges();

    expect(component.createError()).toBe('');
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Failed to create project.');
  });

  it('shows a fallback error when project creation fails unexpectedly', () => {
    projectService.createProject.mockReturnValue(throwError(() => null));
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.toggleModal(true);
    component.projectForm.setValue({
      title: 'New project',
      description: 'Project details',
      budget: 100,
      deadline: '2030-01-01',
      status: 'Planning'
    });

    component.onCreateProject();
    fixture.detectChanges();

    expect(component.isModalOpen()).toBe(true);
    expect(component.createError()).toBe('Failed to create project.');
  });

  it('updates project status optimistically and persists the change', () => {
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const project = component.projects()[0];

    component.onProjectStatusChange({ project, newStatus: 'Completed' });

    expect(component.projects()[0].status).toBe('Completed');
    expect(projectService.updateStatus).toHaveBeenCalledWith('project-1', 'Completed');
  });

  it('rolls back a project status when persistence fails', () => {
    projectService.updateStatus.mockReturnValue(throwError(() => new Error('offline')));
    fixture = TestBed.createComponent(ProjectDashboardComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const project = component.projects()[0];

    component.onProjectStatusChange({ project, newStatus: 'Completed' });

    expect(component.projects()[0].status).toBe('Active');
  });

});
