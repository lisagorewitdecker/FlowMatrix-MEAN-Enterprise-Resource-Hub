import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => httpTesting.verify());

  it('attaches bearer tokens to API calls but not unrelated requests', () => {
    authService.accessToken.set('access-token');

    http.get('/api/projects').subscribe();
    http.get('/assets/config.json').subscribe();

    const apiRequest = httpTesting.expectOne('/api/projects');
    const assetRequest = httpTesting.expectOne('/assets/config.json');
    expect(apiRequest.request.headers.get('Authorization')).toBe('Bearer access-token');
    expect(assetRequest.request.headers.has('Authorization')).toBe(false);
    apiRequest.flush({});
    assetRequest.flush({});
  });

  it('does not attach bearer tokens or refresh after failed login and registration requests', () => {
    authService.accessToken.set('existing-token');

    http.post('/api/auth/login', {}).subscribe({ error: () => undefined });
    const loginRequest = httpTesting.expectOne('/api/auth/login');
    expect(loginRequest.request.headers.has('Authorization')).toBe(false);
    loginRequest.flush(
      { success: false, message: 'Invalid credentials' },
      { status: 401, statusText: 'Unauthorized' }
    );

    http.post('/api/auth/register', {}).subscribe({ error: () => undefined });
    const registrationRequest = httpTesting.expectOne('/api/auth/register');
    expect(registrationRequest.request.headers.has('Authorization')).toBe(false);
    registrationRequest.flush(
      { success: false, message: 'Registration failed' },
      { status: 401, statusText: 'Unauthorized' }
    );

    httpTesting.expectNone('/api/auth/refresh');
  });

  it('refreshes an expired API token and retries the original request once', () => {
    authService.accessToken.set('expired-token');
    let response: unknown;

    http.get('/api/projects').subscribe((value) => response = value);
    const originalRequest = httpTesting.expectOne('/api/projects');
    expect(originalRequest.request.headers.get('Authorization')).toBe('Bearer expired-token');
    originalRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTesting.expectOne('/api/auth/refresh');
    expect(refreshRequest.request.withCredentials).toBe(true);
    refreshRequest.flush({ success: true, accessToken: 'fresh-token' });

    const retriedRequest = httpTesting.expectOne('/api/projects');
    expect(retriedRequest.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retriedRequest.flush({ success: true, data: [] });

    expect(response).toEqual({ success: true, data: [] });
    expect(authService.accessToken()).toBe('fresh-token');
  });
});