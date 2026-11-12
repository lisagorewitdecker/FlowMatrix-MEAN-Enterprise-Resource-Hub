import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  message: string;
  token?: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  signup(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, credentials);
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(payload: { token: string; newPassword: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/reset-password`, payload);
  }
}
