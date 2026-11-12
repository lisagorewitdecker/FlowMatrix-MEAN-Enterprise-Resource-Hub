import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Component, input, output } from '@angular/core';
import { Project, ProjectStatus } from '../../services/project.service';

export interface ProjectStatusChange {
  project: Project;
  newStatus: ProjectStatus;
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CdkDropListGroup],
  template: `
    <div class="kanban-board" cdkDropListGroup>
      @for (status of statuses; track status) {
        <section class="kanban-column" [attr.aria-labelledby]="'kanban-heading-' + status">
          <h2 class="column-heading" [id]="'kanban-heading-' + status">
            {{ status }} <span class="project-count">({{ projectsForStatus(status).length }})</span>
          </h2>
          <div
            class="kanban-list"
            cdkDropList
            [cdkDropListData]="status"
            [attr.aria-label]="status + ' projects'"
            (cdkDropListDropped)="onDrop($event)">
            @for (project of projectsForStatus(status); track project._id) {
              <article class="project-card" cdkDrag [cdkDragData]="project">
                <h3 class="project-title">{{ project.title }}</h3>
                <p class="project-description">{{ project.description }}</p>
                <label class="sr-only" [attr.for]="'project-status-' + project._id">
                  Status for {{ project.title }}
                </label>
                <select
                  class="status-select"
                  [id]="'project-status-' + project._id"
                  [attr.aria-label]="'Status for ' + project.title"
                  [value]="project.status"
                  (change)="onStatusSelected(project, $event)">
                  @for (option of statuses; track option) {
                    <option [value]="option">{{ option }}</option>
                  }
                </select>
              </article>
            } @empty {
              <p class="empty-column">No projects</p>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(4, minmax(16rem, 1fr));
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
    .kanban-column {
      min-width: 16rem;
      padding: 1rem;
      border: 1px solid #334155;
      border-radius: 0.75rem;
      background: #0f172a;
    }
    .column-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 0 1rem;
      color: #e2e8f0;
      font-size: 0.95rem;
    }
    .project-count {
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .kanban-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 8rem;
    }
    .project-card {
      padding: 0.9rem;
      border: 1px solid #334155;
      border-radius: 0.6rem;
      background: #1e293b;
      cursor: grab;
    }
    .project-card:active {
      cursor: grabbing;
    }
    .project-title {
      margin: 0;
      color: #f8fafc;
      font-size: 0.95rem;
    }
    .project-description {
      margin: 0.5rem 0 0.85rem;
      color: #cbd5e1;
      font-size: 0.85rem;
    }
    .status-select {
      width: 100%;
      padding: 0.45rem 0.6rem;
      border: 1px solid #475569;
      border-radius: 0.4rem;
      background: #0f172a;
      color: #f8fafc;
      font: inherit;
    }
    .status-select:focus-visible {
      outline: 2px solid #818cf8;
      outline-offset: 2px;
    }
    .empty-column {
      margin: 0;
      padding: 0.75rem 0;
      color: #64748b;
      font-size: 0.85rem;
      text-align: center;
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
    @media (max-width: 720px) {
      .kanban-board {
        grid-template-columns: repeat(4, minmax(15rem, 1fr));
      }
      .kanban-column {
        min-width: 15rem;
      }
    }
  `]
})
export class KanbanBoardComponent {
  readonly statuses: ProjectStatus[] = ['Planning', 'Active', 'Completed', 'On-Hold'];
  readonly projects = input.required<Project[]>();
  readonly statusChange = output<ProjectStatusChange>();

  projectsForStatus(status: ProjectStatus): Project[] {
    return this.projects().filter((project) => project.status === status);
  }

  onDrop(event: CdkDragDrop<ProjectStatus, ProjectStatus, Project>): void {
    this.emitStatusChange(event.item.data, event.container.data);
  }

  onStatusSelected(project: Project, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value as ProjectStatus;
    this.emitStatusChange(project, newStatus);
  }

  private emitStatusChange(project: Project, newStatus: ProjectStatus): void {
    if (project.status === newStatus) return;
    this.statusChange.emit({ project, newStatus });
  }
}