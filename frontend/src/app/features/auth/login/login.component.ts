import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { applyServerValidationErrors } from '../../../core/utils/form.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatInputModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, TranslateModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-left">
        <div class="brand">
          <div class="logo">
            <mat-icon class="logo-icon">bolt</mat-icon>
          </div>
          <h1>CirqueTask</h1>
          <p>{{ 'auth.login.brandSubtitle' | translate }}</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <mat-icon>dashboard</mat-icon>
            <span>{{ 'auth.login.feature1' | translate }}</span>
          </div>
          <div class="feature-item">
            <mat-icon>sync</mat-icon>
            <span>{{ 'auth.login.feature2' | translate }}</span>
          </div>
          <div class="feature-item">
            <mat-icon>analytics</mat-icon>
            <span>{{ 'auth.login.feature3' | translate }}</span>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2>{{ 'auth.login.title' | translate }}</h2>
          <p class="subtitle">{{ 'auth.login.subtitle' | translate }}</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'auth.login.email' | translate }}</mat-label>
              <input matInput formControlName="email" type="email" [placeholder]="'auth.login.emailPlaceholder' | translate">
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>{{ 'auth.login.emailRequired' | translate }}</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>{{ 'auth.login.emailInvalid' | translate }}</mat-error>
              }
              @if (loginForm.get('email')?.hasError('serverError')) {
                <mat-error>{{ loginForm.get('email')?.getError('serverError') }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'auth.login.password' | translate }}</mat-label>
              <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>{{ 'auth.login.passwordRequired' | translate }}</mat-error>
              }
              @if (loginForm.get('password')?.hasError('serverError')) {
                <mat-error>{{ loginForm.get('password')?.getError('serverError') }}</mat-error>
              }
            </mat-form-field>

            <p class="forgot-link">
              <a routerLink="/auth/forgot-password">{{ 'auth.login.forgotPassword.link' | translate }}</a>
            </p>

            <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'auth.login.signIn' | translate }}
              }
            </button>
          </form>

          <p class="auth-link">
            {{ 'auth.login.noAccount' | translate }} <a routerLink="/auth/register">{{ 'auth.login.createOne' | translate }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      min-height: 100vh;
    }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 48px;
      color: white;
    }
    .brand { text-align: center; margin-bottom: 48px; }
    .logo {
      width: 80px; height: 80px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      backdrop-filter: blur(10px);
    }
    .logo-icon { font-size: 40px; width: 40px; height: 40px; overflow: hidden; }
    .brand h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; }
    .brand p { opacity: 0.8; margin-top: 8px; font-size: 1.1rem; }
    .features { display: flex; flex-direction: column; gap: 16px; }
    .feature-item {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.1);
      padding: 12px 24px; border-radius: 12px;
      backdrop-filter: blur(10px);
      font-weight: 500;
      mat-icon { width: 24px; min-width: 24px; height: 24px; flex-shrink: 0; }
    }
    .auth-right {
      flex: 1;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-primary);
      padding: 48px;
    }
    .auth-form-wrapper {
      width: 100%; max-width: 420px;
    }
    .auth-form-wrapper h2 {
      font-size: 1.75rem; font-weight: 700;
      color: var(--text-primary); margin-bottom: 8px;
    }
    .subtitle {
      color: var(--text-secondary); margin-bottom: 32px;
    }
    form { display: flex; flex-direction: column; gap: 4px; }
    .submit-btn {
      width: 100%; height: 48px; font-size: 1rem;
      font-weight: 600; border-radius: 12px; margin-top: 8px;
    }
    .forgot-link {
      text-align: right; margin-top: -8px; margin-bottom: 8px;
      a { color: var(--primary); font-size: 0.875rem; font-weight: 500; }
    }
    .auth-link {
      text-align: center; margin-top: 24px;
      color: var(--text-secondary);
      a { color: var(--primary); font-weight: 600; }
    }
    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { padding: 24px; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = signal(true);
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const data = err.error?.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          applyServerValidationErrors(this.loginForm, data as Record<string, string>);
          this.snackBar.open(err.error?.message || this.translate.instant('auth.login.invalidCredentials'), this.translate.instant('common.close'), { duration: 4000 });
        } else {
          this.snackBar.open(err.error?.message || this.translate.instant('auth.login.invalidCredentials'), this.translate.instant('common.close'), { duration: 4000 });
        }
      }
    });
  }
}
