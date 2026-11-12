import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './login.component.css',
  template: `
    <main class="login-page">
      <section class="login-card" aria-labelledby="login-heading">
        <h1 id="login-heading" class="login-title">FlowMatrix Login</h1>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" novalidate>
          <div class="form-field">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-input"
              placeholder="name@company.com"
              autocomplete="email"
              [attr.aria-invalid]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
              aria-describedby="email-error"
            />
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
              <small id="email-error" class="field-error" role="alert">
                A valid email address is required.
              </small>
            }
          </div>

          <div class="form-field">
            <div class="label-row">
              <div class="label-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <label for="password">Password</label>
                <a routerLink="/forgot-password" style="color: #60a5fa; font-size: 0.85rem; margin-left: 20px; margin-right:20px; text-decoration: none;">Forgot password?</a>
              </div>
            </div>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-input"
              placeholder="••••••••"
              autocomplete="current-password"
              [attr.aria-invalid]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
              aria-describedby="password-error"
            />
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
              <small id="password-error" class="field-error" role="alert">
                Password must be at least 6 characters.
              </small>
            }
          </div>


          @if (errorMessage) {
            <div class="login-error" role="alert" aria-live="assertive">
              {{ errorMessage }}
            </div>
          }

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="login-submit"
          >
            @if (isLoading) { Logging in... } @else { Sign In }
          </button>
        </form>

        <div class="card-footer">
          <span>Don't have an account?</span>
          <a routerLink="/signup" class="secondary-btn">Create Account</a>
        </div>
      </section>
    </main>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
