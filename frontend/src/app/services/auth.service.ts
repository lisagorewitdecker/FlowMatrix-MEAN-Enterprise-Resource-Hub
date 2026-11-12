import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id?: string;
  _id?: string;
  name?: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  token?: string;
  user?: User;
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly apiUrl = '/api/auth';

  // Initialize signals directly from localStorage on browser boot
  currentUser = signal<User | null>(this.getStoredUser());
  accessToken = signal<string | null>(this.getStoredToken());

  private getStoredToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('flowmatrix_token');
    }
    return null;
  }

  private getStoredUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('flowmatrix_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private saveSession(token: string, user?: User): void {
    this.accessToken.set(token);
    if (user) {
      this.currentUser.set(user);
    }
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('flowmatrix_token', token);
      if (user) {
        localStorage.setItem('flowmatrix_user', JSON.stringify(user));
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap((res) => {
        const token = res.accessToken || res.token;
        if (token) {
          this.saveSession(token, res.user);
        }
      })
    );
  }

  signup(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, credentials);
  }

  register(data: { name: string; email: string; password: string; role?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap((res) => {
        const token = res.accessToken || res.token;
        if (token) {
          this.accessToken.set(token);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('flowmatrix_token', token);
          }
        }
      })
    );
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(payload: { token: string; newPassword: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, payload);
  }

  logout(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('flowmatrix_token');
      localStorage.removeItem('flowmatrix_user');
    }
  }
}
