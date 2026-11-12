import { TestBed } from '@angular/core/testing';
import { App } from './app.component';
import { LoginComponent } from './app/components/login/login.component';
import { MainLayoutComponent } from './app/components/layout/main-layout.component';
import { ProjectDashboardComponent } from './app/components/project-dashboard/project-dashboard.component';
import { AnalyticsComponent } from './app/components/analytics/analytics.component';
import { SignupComponent } from './app/auth/signup/signup-component';
import { ForgotPasswordComponent } from './app/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './app/auth/reset-password/reset-password.component';
import { authGuard } from './app/guards/auth.guard';
import { routes } from './app/app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the router outlet instead of the CLI placeholder', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.textContent).not.toContain('Hello, frontend');
  });

  it('routes login and guarded layout with nested project and analytics routes', () => {
    const layoutRoute = routes.find((route) => route.path === '');

    expect(routes.find((route) => route.path === 'login')?.component).toBe(LoginComponent);
    expect(routes.find((route) => route.path === 'signup')?.component).toBe(SignupComponent);
    expect(routes.find((route) => route.path === 'forgot-password')?.component).toBe(ForgotPasswordComponent);
    expect(routes.find((route) => route.path === 'reset-password')?.component).toBe(ResetPasswordComponent);
    expect(layoutRoute?.component).toBe(MainLayoutComponent);
    expect(layoutRoute?.canActivate).toContain(authGuard);
    expect(layoutRoute?.children?.find((route) => route.path === 'projects')?.component).toBe(ProjectDashboardComponent);
    expect(layoutRoute?.children?.find((route) => route.path === 'analytics')?.component).toBe(AnalyticsComponent);
  });
});
