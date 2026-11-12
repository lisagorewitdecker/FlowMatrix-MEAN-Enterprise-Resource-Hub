import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Skip to Content for Keyboard/Screen Reader Navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <div class="app-layout">
      <!-- Semantic Sidebar Landmark -->
      <aside class="app-sidebar" aria-label="Main Navigation">
        <div>
          <div class="sidebar-brand">
            <h1>FlowMatrix</h1>
            <p>Enterprise Resource Hub</p>
          </div>
          <nav class="sidebar-nav">
            <a
              routerLink="/projects"
              routerLinkActive="active-nav"
              class="nav-link"
              aria-label="View Projects and Kanban Dashboard">
              <span aria-hidden="true">📊</span> Projects
            </a>
            <a
              routerLink="/analytics"
              routerLinkActive="active-nav"
              class="nav-link"
              aria-label="View Performance Analytics and KPIs">
              <span aria-hidden="true">📈</span> Analytics & KPIs
            </a>
          </nav>
        </div>

        <div class="sidebar-footer">
          <button
            type="button"
            (click)="logout()"
            class="signout-btn"
            aria-label="Sign out of FlowMatrix">
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Work Area -->
      <div class="content-wrapper">
        <header class="top-nav" role="banner">
          <div class="welcome-text">
            Welcome back, <strong class="user-highlight">{{ authService.currentUser()?.name || 'User' }}</strong>
          </div>
          <div class="role-badge" aria-label="Assigned user role">
            Role: <span>{{ authService.currentUser()?.role || 'Contributor' }}</span>
          </div>
        </header>

        <main id="main-content" class="page-content" tabindex="-1">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .skip-link {
      position: absolute;
      top: -3rem;
      left: 1rem;
      background: #2563eb;
      color: #ffffff;
      padding: 0.5rem 1rem;
      z-index: 9999;
      font-weight: 700;
      border-radius: 0 0 0.375rem 0.375rem;
      transition: top 0.15s ease;
    }
    .skip-link:focus {
      top: 0;
      outline: 2px solid #ffffff;
    }

    .app-layout {
      display: flex;
      height: 100vh;
      background-color: #020617;
      color: #f8fafc;
      overflow: hidden;
    }

    .app-sidebar {
      width: 17rem;
      background-color: #0b1120;
      border-right: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.5rem 1rem;
    }

    .sidebar-brand {
      padding: 0.5rem 0.75rem 1.25rem;
      border-bottom: 1px solid #1e293b;
    }
    .sidebar-brand h1 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #818cf8;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .sidebar-brand p {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0.35rem 0 0;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 1.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.9rem;
      border-radius: 0.5rem;
      color: #cbd5e1;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }
    .nav-link:hover {
      background-color: #1e293b;
      color: #ffffff;
    }
    .nav-link:focus-visible {
      outline: 2px solid #6366f1;
      outline-offset: 2px;
    }
    .active-nav {
      background-color: rgba(99, 102, 241, 0.18);
      color: #a5b4fc;
      border-color: rgba(99, 102, 241, 0.4);
    }

    .sidebar-footer {
      border-top: 1px solid #1e293b;
      padding-top: 1rem;
    }
    .signout-btn {
      width: 100%;
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      padding: 0.65rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .signout-btn:hover {
      background: #334155;
    }
    .signout-btn:focus-visible {
      outline: 2px solid #818cf8;
      outline-offset: 2px;
    }

    .content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .top-nav {
      height: 4rem;
      background: #0b1120;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      flex-shrink: 0;
    }
    .welcome-text {
      font-size: 0.95rem;
      color: #cbd5e1;
    }
    .user-highlight {
      color: #a5b4fc;
    }
    .role-badge {
      font-size: 0.8rem;
      background: rgba(79, 70, 229, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.5);
      color: #c7d2fe;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-weight: 600;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      outline: none;
    }
  `]
})
export class MainLayoutComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
