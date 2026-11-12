import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { passwordStrengthValidator, passwordMatchValidator } from '../../validators/password.validator';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  resetForm!: FormGroup;
  token = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, passwordStrengthValidator]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator }
    );
  }

  onSubmit(): void {
    if (this.resetForm.invalid || this.isSubmitting || !this.token) {
      if (!this.token) {
        this.errorMessage = 'Reset token is missing from the URL.';
      }
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService
      .resetPassword({ token: this.token, newPassword: this.resetForm.value.password })
      .subscribe({
        next: () => {
          this.successMessage = 'Password updated successfully! Redirecting to login...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Password reset failed or token expired.';
          this.isSubmitting = false;
        }
      });
  }
}
