import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface PortfolioSummary {
  totalProjects: number;
  totalBudget: number;
  avgBudget: number;
}

export interface VelocityTelemetry {
  overdueCount: number;
  completedCount: number;
  completionRate: number;
}

export interface StatusMetric {
  _id: string;
  totalProjects: number;
  totalBudget: number;
  avgBudget: number;
  budgetShare: number;
  projectShare: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-root">
      <!-- Header -->
      <header class="analytics-header">
        <div>
          <h2 id="analytics-title" class="title">Executive Analytics & KPIs</h2>
          <p class="subtitle">Real-time portfolio capital allocation, project velocity, and status telemetry.</p>
        </div>
        <button
          type="button"
          (click)="fetchAnalytics()"
          class="refresh-btn"
          [disabled]="loading()"
          aria-label="Refresh executive analytics data">
          {{ loading() ? 'Updating...' : '↻ Refresh Metrics' }}
        </button>
      </header>

      <!-- Accessible Live Announcement -->
      <div class="sr-only" role="status" aria-live="polite">
        {{ loading() ? 'Loading analytics telemetry...' : 'Analytics metrics up to date.' }}
      </div>

      @if (loading()) {
        <div class="state-container" role="status">
          <div class="spinner" aria-hidden="true"></div>
          <p>Calculating portfolio aggregations...</p>
        </div>
      } @else if (errorMessage()) {
        <div class="error-container" role="alert">
          <p><strong>Error:</strong> {{ errorMessage() }}</p>
        </div>
      } @else {
        <!-- Portfolio Summary KPIs -->
        <section aria-labelledby="portfolio-kpis" class="kpi-section">
          <h3 id="portfolio-kpis" class="section-heading">Portfolio Summary</h3>
          <div class="kpi-grid">
            <article class="kpi-card">
              <span class="kpi-label">Total Projects</span>
              <div class="kpi-value text-indigo">{{ summary().totalProjects }}</div>
              <span class="kpi-hint">Managed initiatives</span>
            </article>

            <article class="kpi-card">
              <span class="kpi-label">Cumulative Budget</span>
              <div class="kpi-value text-emerald">\${{ summary().totalBudget | number:'1.0-0' }}</div>
              <span class="kpi-hint">Total capital commitment</span>
            </article>

            <article class="kpi-card">
              <span class="kpi-label">Average Investment</span>
              <div class="kpi-value text-sky">\${{ summary().avgBudget | number:'1.0-0' }}</div>
              <span class="kpi-hint">Mean per project</span>
            </article>

            <article class="kpi-card">
              <span class="kpi-label">Portfolio Completion</span>
              <div class="kpi-value text-purple">{{ velocity().completionRate }}%</div>
              <span class="kpi-hint">{{ velocity().completedCount }} completed · {{ velocity().overdueCount }} overdue</span>
            </article>
          </div>
        </section>

        <!-- Capital Allocation Bar -->
        @if (statusBreakdown().length > 0) {
          <section aria-labelledby="allocation-meters" class="allocation-section">
            <h3 id="allocation-meters" class="section-heading">Capital Allocation Distribution</h3>
            <div class="distribution-bar" role="meter" aria-label="Budget distribution by status">
              @for (item of statusBreakdown(); track item._id) {
                <div
                  class="bar-segment"
                  [ngClass]="getSegmentClass(item._id)"
                  [style.width.%]="item.budgetShare || item.projectShare"
                  [title]="item._id + ': ' + (item.budgetShare || item.projectShare) + '%'">
                </div>
              }
            </div>
            <div class="legend-row">
              @for (item of statusBreakdown(); track item._id) {
                <div class="legend-item">
                  <span class="dot" [ngClass]="getDotClass(item._id)"></span>
                  <span class="legend-label">{{ item._id }}</span>
                  <span class="legend-percent">{{ item.budgetShare || item.projectShare }}%</span>
                </div>
              }
            </div>
          </section>
        }

        <!-- Status Breakdown Grid -->
        <section aria-labelledby="status-telemetry" class="status-section">
          <h3 id="status-telemetry" class="section-heading">Lifecycle Breakdown</h3>
          <div class="status-grid">
            @for (item of statusBreakdown(); track item._id) {
              <article class="status-card" [attr.aria-label]="item._id + ' phase telemetry'">
                <div class="status-header">
                  <span class="status-pill" [ngClass]="getStatusClass(item._id)">
                    <span class="dot" aria-hidden="true"></span>
                    {{ item._id }}
                  </span>
                  <span class="project-count">{{ item.totalProjects }} Project{{ item.totalProjects === 1 ? '' : 's' }}</span>
                </div>

                <div class="status-stat-row">
                  <span class="stat-name">Allocated Budget:</span>
                  <span class="stat-val">\${{ item.totalBudget | number }}</span>
                </div>

                <div class="status-stat-row">
                  <span class="stat-name">Average Project Size:</span>
                  <span class="stat-val">\${{ item.avgBudget | number:'1.0-0' }}</span>
                </div>

                <div class="status-stat-row">
                  <span class="stat-name">Portfolio Share:</span>
                  <span class="stat-val text-indigo">{{ item.projectShare }}% of projects</span>
                </div>
              </article>
            } @empty {
              <div class="empty-analytics">
                No active project records found. Add projects from the Projects Hub to generate analytics.
              </div>
            }
          </div>
        </section>

        <!-- Tabular Audit Table -->
        <section aria-labelledby="table-heading" class="table-section">
          <h3 id="table-heading" class="section-heading">Tabular Audit Breakdown</h3>
          <div class="table-wrapper">
            <table class="accessible-table" aria-describedby="table-heading">
              <caption class="sr-only">Audit of enterprise projects and financial allocations by status</caption>
              <thead>
              <tr>
                <th scope="col">Status Phase</th>
                <th scope="col">Total Projects</th>
                <th scope="col">Project Share</th>
                <th scope="col">Total Budget ($)</th>
                <th scope="col">Average Budget ($)</th>
              </tr>
              </thead>
              <tbody>
                @for (row of statusBreakdown(); track row._id) {
                  <tr>
                    <td><strong>{{ row._id }}</strong></td>
                    <td>{{ row.totalProjects }}</td>
                    <td>{{ row.projectShare }}%</td>
                    <td>\${{ row.totalBudget | number }}</td>
                    <td>\${{ row.avgBudget | number:'1.0-0' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-cell">No project data to audit.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .analytics-root {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 1.25rem;
    }

    .title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #818cf8;
      margin: 0;
      letter-spacing: -0.025em;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 0.9rem;
      margin: 0.35rem 0 0;
    }

    .refresh-btn {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      padding: 0.55rem 1.1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }
    .refresh-btn:hover:not(:disabled) {
      background: #334155;
      border-color: #475569;
    }
    .refresh-btn:focus-visible {
      outline: 2px solid #818cf8;
      outline-offset: 2px;
    }
    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .section-heading {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 1rem;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .kpi-card {
      background: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .kpi-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }

    .kpi-value {
      font-size: 2.15rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 0.25rem 0;
    }
    .text-indigo { color: #818cf8; }
    .text-emerald { color: #34d399; }
    .text-sky { color: #38bdf8; }
    .text-purple { color: #c084fc; }

    .kpi-hint {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* Distribution Progress Bar */
    .distribution-bar {
      display: flex;
      height: 1.25rem;
      border-radius: 0.5rem;
      overflow: hidden;
      background: #1e293b;
      margin-bottom: 0.75rem;
    }
    .bar-segment {
      height: 100%;
      min-width: 0.5rem;
      transition: width 0.3s ease;
    }
    .seg-planning { background: #38bdf8; }
    .seg-active { background: #34d399; }
    .seg-onhold { background: #fbbf24; }
    .seg-completed { background: #c084fc; }

    .legend-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    .legend-label { color: #cbd5e1; }
    .legend-percent { color: #94a3b8; font-weight: 600; }

    /* Status Grid */
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .status-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 0.75rem;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
    }
    .dot {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 9999px;
      background: currentColor;
    }

    .badge-planning { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .badge-active { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); }
    .badge-onhold { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
    .badge-completed { background: rgba(192, 132, 252, 0.15); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3); }

    .project-count {
      font-size: 0.85rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .status-stat-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
    }
    .stat-name { color: #94a3b8; }
    .stat-val { color: #f8fafc; font-weight: 600; }

    /* Accessible Table */
    .table-wrapper {
      background: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      overflow-x: auto;
    }

    .accessible-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .accessible-table th,
    .accessible-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #1e293b;
    }

    .accessible-table th {
      background: #0f172a;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .accessible-table tr:last-child td {
      border-bottom: none;
    }

    .accessible-table tr:hover td {
      background: rgba(30, 41, 59, 0.4);
    }

    .empty-cell {
      text-align: center;
      color: #64748b;
      padding: 2rem;
    }

    .state-container, .error-container, .empty-analytics {
      padding: 3rem 1rem;
      text-align: center;
      border: 1px dashed #334155;
      border-radius: 0.75rem;
      color: #94a3b8;
    }
    .error-container {
      border-color: #dc2626;
      background: rgba(153, 27, 27, 0.2);
      color: #fca5a5;
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      margin: 0 auto 1rem;
      border: 3px solid #334155;
      border-top-color: #818cf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
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
export class AnalyticsComponent implements OnInit {
  private http = inject(HttpClient);

  summary = signal<PortfolioSummary>({
    totalProjects: 0,
    totalBudget: 0,
    avgBudget: 0
  });

  velocity = signal<VelocityTelemetry>({
    overdueCount: 0,
    completedCount: 0,
    completionRate: 0
  });

  statusBreakdown = signal<StatusMetric[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  fetchAnalytics(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.http.get<any>('/api/analytics').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // 1. Faceted Aggregation Format
          if (res.data.summary) {
            this.summary.set(res.data.summary);
            this.velocity.set(res.data.velocity || { overdueCount: 0, completedCount: 0, completionRate: 0 });
            this.statusBreakdown.set(res.data.statusBreakdown || []);
          } else {
            // 2. Backward-Compatible Fallback Format: { totalProjects, projectsByStatus }
            const total = res.data.totalProjects || 0;
            const rawStatuses: any[] = res.data.projectsByStatus || [];

            this.summary.set({
              totalProjects: total,
              totalBudget: 0,
              avgBudget: 0
            });

            this.statusBreakdown.set(
              rawStatuses.map((s: any) => ({
                _id: s._id || 'Unknown',
                totalProjects: s.count || s.totalProjects || 0,
                totalBudget: s.totalBudget || 0,
                avgBudget: s.avgBudget || 0,
                budgetShare: 0,
                projectShare: total ? Math.round(((s.count || s.totalProjects || 0) / total) * 100) : 0
              }))
            );
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err.status === 403
            ? 'Access Denied: You do not have permission to view executive analytics.'
            : 'Unable to connect to the analytics telemetry service.'
        );
        this.loading.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'badge-active';
      case 'Planning': return 'badge-planning';
      case 'Completed': return 'badge-completed';
      case 'On-Hold': return 'badge-onhold';
      default: return '';
    }
  }

  getSegmentClass(status: string): string {
    switch (status) {
      case 'Active': return 'seg-active';
      case 'Planning': return 'seg-planning';
      case 'Completed': return 'seg-completed';
      case 'On-Hold': return 'seg-onhold';
      default: return '';
    }
  }

  getDotClass(status: string): string {
    switch (status) {
      case 'Active': return 'badge-active';
      case 'Planning': return 'badge-planning';
      case 'Completed': return 'badge-completed';
      case 'On-Hold': return 'badge-onhold';
      default: return '';
    }
  }
}
