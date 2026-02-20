import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthRequest, AuthResponse, RegisterRequest, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  login(request: AuthRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response.success) {
          this.storeAuth(response.data);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        if (response.success) {
          this.storeAuth(response.data);
        }
      })
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.success) {
          this.storeAuth(response.data);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  updateCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  updateProfile(data: { firstName?: string; lastName?: string; bio?: string }): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.usersUrl}/me`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.updateCurrentUser(res.data);
        }
      })
    );
  }

  private storeAuth(authResponse: AuthResponse): void {
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    this.currentUserSignal.set(authResponse.user);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSignal.set(user);
      } catch {
        this.logout();
      }
    }
  }
}
