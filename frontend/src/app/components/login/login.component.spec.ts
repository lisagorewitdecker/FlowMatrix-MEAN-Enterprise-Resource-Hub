import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('displays the API login message without attempting navigation', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(throwError(() => ({
        error: { message: 'Invalid credentials' }
      })))
    };
    const router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.loginForm.setValue({ email: 'user@example.com', password: 'password' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});