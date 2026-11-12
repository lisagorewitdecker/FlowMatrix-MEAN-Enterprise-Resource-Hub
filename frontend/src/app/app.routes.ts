import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './auth/signup/signup-component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { ProjectDashboardComponent } from './components/project-dashboard/project-dashboard.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public auth routes
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Protected application routes
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'projects', component: ProjectDashboardComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: '', redirectTo: 'projects', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
