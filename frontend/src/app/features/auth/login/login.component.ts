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
    <div class="auth-page">
      <div class="auth-hero">
        <div class="hero-content">
          <div class="hero-brand">
            <div class="logo-mark"><mat-icon>bolt</mat-icon></div>
            <h1>CirqueTask</h1>
            <p>{{ 'auth.login.brandSubtitle' | translate }}</p>
          </div>
          <div class="hero-features">
            <div class="feature">
              <div class="feature-icon"><mat-icon>space_dashboard</mat-icon></div>
              <span>{{ 'auth.login.feature1' | translate }}</span>
            </div>
            <div class="feature">
              <div class="feature-icon"><mat-icon>sync</mat-icon></div>
              <span>{{ 'auth.login.feature2' | translate }}</span>
            </div>
            <div class="feature">
              <div class="feature-icon"><mat-icon>analytics</mat-icon></div>
              <span>{{ 'auth.login.feature3' | translate }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-form-side">
        <div class="form-container">
          <div class="form-header">
            <h2>{{ 'auth.login.title' | translate }}</h2>
            <p>{{ 'auth.login.subtitle' | translate }}</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'auth.login.email' | translate }}</mat-label>
              <input matInput formControlName="email" type="email" [placeholder]="'auth.login.emailPlaceholder' | translate">
              <mat-icon matPrefix>mail_outline</mat-icon>
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
              <mat-icon matPrefix>lock_outline</mat-icon>
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

            <div class="forgot-row">
              <a routerLink="/auth/forgot-password" class="forgot-link">{{ 'auth.login.forgotPassword.link' | translate }}</a>
            </div>

            <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'auth.login.signIn' | translate }}
              }
            </button>
          </form>

          <div class="auth-footer">
            {{ 'auth.login.noAccount' | translate }}
            <a routerLink="/auth/register">{{ 'auth.login.createOne' | translate }}</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
    }

    .auth-hero {
      flex: 1;
      background: linear-gradient(160deg, #312e81 0%, #4338ca 40%, #6366f1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 30% 70%, rgba(129,140,248,0.2) 0%, transparent 60%);
      }
    }

    .hero-content {
      position: relative;
      z-index: 1;
      color: white;
      max-width: 400px;
    }

    .hero-brand {
      margin-bottom: var(--space-12);
    }

    .logo-mark {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-lg);
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-5);
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    }

    .hero-brand h1 {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: var(--space-2);
      color: white;
    }

    .hero-brand p {
      font-size: 1rem;
      opacity: 0.75;
      line-height: 1.5;
    }

    .hero-features {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .feature {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(8px);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .feature-icon {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: var(--radius-sm);
      background: rgba(255,255,255,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .auth-form-side {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      background: var(--bg-primary);
    }

    .form-container {
      width: 100%;
      max-width: 400px;
    }

    .form-header {
      margin-bottom: var(--space-8);
      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin-bottom: var(--space-2);
      }
      p {
        color: var(--text-secondary);
        font-size: 0.9375rem;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .forgot-row {
      text-align: right;
      margin: -4px 0 var(--space-3);
    }

    .forgot-link {
      color: var(--primary);
      font-size: 0.8125rem;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }

    .submit-btn {
      width: 100%;
      height: 44px;
      font-size: 0.9375rem;
      font-weight: 600;
      border-radius: var(--radius) !important;
    }

    .auth-footer {
      text-align: center;
      margin-top: var(--space-6);
      font-size: 0.875rem;
      color: var(--text-secondary);
      a {
        color: var(--primary);
        font-weight: 600;
        margin-left: 4px;
        &:hover { text-decoration: underline; }
      }
    }

    @media (max-width: 768px) {
      .auth-hero { display: none; }
      .auth-form-side { padding: var(--space-6); }
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
