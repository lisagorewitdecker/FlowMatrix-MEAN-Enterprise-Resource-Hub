import { Component, OnInit, PLATFORM_ID, HostListener, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService, Project, ProjectStatus } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { KanbanBoardComponent } from '../kanban-board/kanban-board.component';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, KanbanBoardComponent],
  template: `
    <div class="dashboard-root">
      <!-- Section Header -->
      <header class="dashboard-header">
        <div>
          <h2 class="page-title">Projects Hub</h2>
          <p class="page-sub">Track delivery phases, budget allocations, and status velocity.</p>
        </div>

        <div class="actions-group">
          <!-- Accessible View Mode Switcher -->
          <div role="group" aria-label="Project View Layout" class="view-toggle">
            <button
              type="button"
              (click)="viewMode.set('kanban')"
              [class.active]="viewMode() === 'kanban'"
              [attr.aria-pressed]="viewMode() === 'kanban'"
              class="toggle-btn">
              Kanban Board
            </button>
            <button
              type="button"
              (click)="viewMode.set('grid')"
              [class.active]="viewMode() === 'grid'"
              [attr.aria-pressed]="viewMode() === 'grid'"
              class="toggle-btn">
              Table / Grid
            </button>
          </div>

          <button
            type="button"
            (click)="toggleModal(true)"
            class="primary-btn"
            aria-haspopup="dialog">
            + New Project
          </button>
        </div>
      </header>

      <!-- Live Region for Announcements -->
      <div class="sr-only" aria-live="polite" role="status">
        Showing {{ projects().length }} projects in {{ viewMode() }} view.
      </div>

      <!-- State: Loading / Error / Data -->
      @if (loading()) {
        <div class="state-message" role="status">Loading enterprise project index...</div>
      } @else if (error()) {
        <div role="alert" class="state-message error-state">{{ error() }}</div>
      } @else {
        @if (viewMode() === 'kanban') {
          <app-kanban-board
            [projects]="projects()"
            (statusChange)="onProjectStatusChange($event)">
          </app-kanban-board>
        } @else {
          <div class="grid-layout">
            @for (project of projects(); track project._id) {
              <article class="project-card" [attr.aria-label]="project.title">
                <div class="card-header">
                  <h3 class="card-title">{{ project.title }}</h3>
                  <span [class]="getStatusClass(project.status)" class="status-badge">
                    <span class="badge-dot" aria-hidden="true"></span>
                    {{ project.status }}
                  </span>
                </div>
                <p class="card-body">{{ project.description }}</p>
                <div class="card-meta">
                  <span><strong>Budget:</strong> \${{ project.budget | number }}</span>
                  <span><strong>Target:</strong> {{ project.deadline | date:'mediumDate' }}</span>
                </div>
              </article>
            } @empty {
              <div class="empty-state">
                <p>No projects registered. Select <strong>+ New Project</strong> to begin tracking.</p>
              </div>
            }
          </div>
        }
      }

      <!-- Accessible Project Modal -->
      @if (isModalOpen()) {
        <div
          class="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          (click)="onBackdropClick($event)">
          <div class="modal-card">
            <div class="modal-header">
              <h2 id="modal-title">Create New Project</h2>
              <button
                type="button"
                (click)="toggleModal(false)"
                class="close-btn"
                aria-label="Close project creation modal">
                ✕
              </button>
            </div>

            <form [formGroup]="projectForm" (ngSubmit)="onCreateProject()" class="modal-form" novalidate>
              @if (createError()) {
                <div role="alert" class="modal-error">{{ createError() }}</div>
              }

              <div class="field">
                <label for="project-title">Project Title <span aria-hidden="true">*</span></label>
                <input
                  id="project-title"
                  formControlName="title"
                  type="text"
                  placeholder="e.g. Infrastructure Modernization"
                  required
                />
              </div>

              <div class="field">
                <label for="project-desc">Description <span aria-hidden="true">*</span></label>
                <textarea
                  id="project-desc"
                  formControlName="description"
                  rows="3"
                  placeholder="Summarize project scope and target deliverables..."
                  required
                ></textarea>
              </div>

              <div class="split-fields">
                <div class="field">
                  <label for="project-budget">Allocated Budget ($) <span aria-hidden="true">*</span></label>
                  <input
                    id="project-budget"
                    formControlName="budget"
                    type="number"
                    min="0"
                    placeholder="50000"
                    required
                  />
                </div>
                <div class="field">
                  <label for="project-deadline">Deadline <span aria-hidden="true">*</span></label>
                  <input
                    id="project-deadline"
                    formControlName="deadline"
                    type="date"
                    required
                  />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="toggleModal(false)" class="btn-cancel">
                  Cancel
                </button>
                <button type="submit" [disabled]="projectForm.invalid" class="btn-save">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-root {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 1.25rem;
    }
    .page-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #818cf8;
      margin: 0;
      letter-spacing: -0.025em;
    }
    .page-sub {
      color: #94a3b8;
      font-size: 0.9rem;
      margin: 0.35rem 0 0;
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .view-toggle {
      display: inline-flex;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 0.5rem;
      padding: 0.25rem;
    }
    .toggle-btn {
      padding: 0.45rem 0.9rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #94a3b8;
      background: transparent;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .toggle-btn.active {
      background: #1e293b;
      color: #a5b4fc;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    .toggle-btn:focus-visible {
      outline: 2px solid #818cf8;
      outline-offset: 2px;
    }

    .primary-btn {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 0.6rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .primary-btn:hover {
      background: #4338ca;
    }
    .primary-btn:focus-visible {
      outline: 2px solid #a5b4fc;
      outline-offset: 2px;
    }

    .grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .project-card {
      background: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: border-color 0.15s ease, transform 0.15s ease;
    }
    .project-card:hover {
      border-color: #334155;
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .card-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      white-space: nowrap;
    }
    .badge-dot {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 9999px;
      background: currentColor;
    }
    .status-planning { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .status-active { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); }
    .status-on-hold { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
    .status-completed { background: rgba(192, 132, 252, 0.15); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3); }

    .card-body {
      color: #94a3b8;
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1.25rem;
    }
    .card-meta {
      border-top: 1px solid #1e293b;
      padding-top: 0.75rem;
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .modal-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 1rem;
      width: 100%;
      max-width: 32rem;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .modal-header h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #e2e8f0;
      margin: 0;
    }
    .close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }
    .close-btn:focus-visible {
      outline: 2px solid #818cf8;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .field label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e1;
    }
    .field input, .field textarea {
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 0.65rem 0.85rem;
      border-radius: 0.5rem;
      font: inherit;
      font-size: 0.9rem;
    }
    .field input:focus-visible, .field textarea:focus-visible {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
    }
    .split-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .btn-cancel {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      padding: 0.6rem 1.1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-save {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 0.6rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class ProjectDashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);

  projects = signal<Project[]>([]);
  viewMode = signal<'grid' | 'kanban'>('kanban');
  loading = signal(false);
  error = signal('');
  createError = signal('');
  isModalOpen = signal(false);

  projectForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    budget: [0, [Validators.required, Validators.min(0)]],
    deadline: ['', Validators.required],
    status: ['Planning']
  });

  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.isModalOpen()) this.toggleModal(false);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchProjects();
    }
  }

  fetchProjects(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.error.set('');
    this.loading.set(true);
    this.projectService.getProjects({ limit: 100 }).subscribe({
      next: (res) => {
        this.projects.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to retrieve enterprise project records.');
        this.loading.set(false);
      }
    });
  }

  onProjectStatusChange(event: { project: Project; newStatus: ProjectStatus }) {
    const previousStatus = event.project.status;

    // Optimistic UI state mutation
    this.projects.update((list) =>
      list.map((p) => (p._id === event.project._id ? { ...p, status: event.newStatus } : p))
    );

    // Synchronize to backend
    this.projectService.updateStatus(event.project._id, event.newStatus).subscribe({
      error: () => {
        // Rollback state if server rejects
        this.projects.update((list) =>
          list.map((p) => (p._id === event.project._id ? { ...p, status: previousStatus } : p))
        );
      }
    });
  }

  toggleModal(open: boolean): void {
    this.isModalOpen.set(open);
    this.createError.set('');
    if (!open) this.projectForm.reset({ status: 'Planning', budget: 0 });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.toggleModal(false);
    }
  }

  onCreateProject(): void {
    if (this.projectForm.invalid) return;

    this.createError.set('');
    const user = this.authService.currentUser();
    const ownerId = user?.id || user?._id;

    if (!ownerId) {
      this.createError.set('Session invalid. Please re-authenticate.');
      return;
    }

    this.projectService.createProject({ ...this.projectForm.value, owner: ownerId }).subscribe({
      next: () => {
        this.toggleModal(false);
        this.fetchProjects();
      },
      error: (err) => {
        this.createError.set(err?.error?.message || 'Failed to create project.');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Planning': return 'status-planning';
      case 'Completed': return 'status-completed';
      case 'On-Hold': return 'status-on-hold';
      default: return '';
    }
  }
}
