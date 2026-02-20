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
  selector: 'app-register',
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
            <p>{{ 'auth.register.brandSubtitle' | translate }}</p>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">10K+</span>
              <span class="stat-label">{{ 'auth.register.statTeams' | translate }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">50K+</span>
              <span class="stat-label">{{ 'auth.register.statProjects' | translate }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">1M+</span>
              <span class="stat-label">{{ 'auth.register.statTasks' | translate }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-form-side">
        <div class="form-container">
          <div class="form-header">
            <h2>{{ 'auth.register.title' | translate }}</h2>
            <p>{{ 'auth.register.subtitle' | translate }}</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'auth.register.firstName' | translate }}</mat-label>
                <input matInput formControlName="firstName">
                @if (registerForm.get('firstName')?.hasError('required') && registerForm.get('firstName')?.touched) {
                  <mat-error>{{ 'common.required' | translate }}</mat-error>
                }
                @if (registerForm.get('firstName')?.hasError('serverError')) {
                  <mat-error>{{ registerForm.get('firstName')?.getError('serverError') }}</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'auth.register.lastName' | translate }}</mat-label>
                <input matInput formControlName="lastName">
                @if (registerForm.get('lastName')?.hasError('required') && registerForm.get('lastName')?.touched) {
                  <mat-error>{{ 'common.required' | translate }}</mat-error>
                }
                @if (registerForm.get('lastName')?.hasError('serverError')) {
                  <mat-error>{{ registerForm.get('lastName')?.getError('serverError') }}</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'auth.register.email' | translate }}</mat-label>
              <input matInput formControlName="email" type="email">
              <mat-icon matPrefix>mail_outline</mat-icon>
              @if (registerForm.get('email')?.hasError('email')) {
                <mat-error>{{ 'auth.register.emailInvalid' | translate }}</mat-error>
              }
              @if (registerForm.get('email')?.hasError('serverError')) {
                <mat-error>{{ registerForm.get('email')?.getError('serverError') }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'auth.register.password' | translate }}</mat-label>
              <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'">
              <mat-icon matPrefix>lock_outline</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.hasError('minlength')) {
                <mat-error>{{ 'auth.register.passwordMinLength' | translate }}</mat-error>
              }
              @if (registerForm.get('password')?.hasError('serverError')) {
                <mat-error>{{ registerForm.get('password')?.getError('serverError') }}</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'auth.register.createAccount' | translate }}
              }
            </button>
          </form>

          <div class="auth-footer">
            {{ 'auth.register.hasAccount' | translate }}
            <a routerLink="/auth/login">{{ 'auth.register.signIn' | translate }}</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; }

    .auth-hero {
      flex: 1;
      background: linear-gradient(160deg, #4c1d95 0%, #6d28d9 40%, #7c3aed 100%);
      display: flex; align-items: center; justify-content: center;
      padding: var(--space-12); position: relative; overflow: hidden;
      &::before {
        content: '';
        position: absolute; inset: 0;
        background: radial-gradient(circle at 70% 30%, rgba(167,139,250,0.2) 0%, transparent 60%);
      }
    }

    .hero-content { position: relative; z-index: 1; color: white; max-width: 400px; }

    .hero-brand { margin-bottom: var(--space-12); }
    .logo-mark {
      width: 56px; height: 56px; border-radius: var(--radius-lg);
      background: rgba(255,255,255,0.15); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: var(--space-5);
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    }
    .hero-brand h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: var(--space-2); color: white; }
    .hero-brand p { font-size: 1rem; opacity: 0.75; line-height: 1.5; }

    .hero-stats {
      display: flex; gap: var(--space-8);
    }
    .stat-item {
      text-align: center;
      .stat-number { display: block; font-size: 1.5rem; font-weight: 800; }
      .stat-label { font-size: 0.8125rem; opacity: 0.7; }
    }

    .auth-form-side {
      flex: 1; display: flex; align-items: center; justify-content: center;
      padding: var(--space-8); background: var(--bg-primary);
    }

    .form-container { width: 100%; max-width: 400px; }

    .form-header {
      margin-bottom: var(--space-8);
      h2 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); margin-bottom: var(--space-2); }
      p { color: var(--text-secondary); font-size: 0.9375rem; }
    }

    form { display: flex; flex-direction: column; gap: var(--space-1); }
    .name-row { display: flex; gap: var(--space-3); mat-form-field { flex: 1; } }
    .submit-btn { width: 100%; height: 44px; font-size: 0.9375rem; font-weight: 600; border-radius: var(--radius) !important; margin-top: var(--space-2); }

    .auth-footer {
      text-align: center; margin-top: var(--space-6); font-size: 0.875rem; color: var(--text-secondary);
      a { color: var(--primary); font-weight: 600; margin-left: 4px; &:hover { text-decoration: underline; } }
    }

    @media (max-width: 768px) {
      .auth-hero { display: none; }
      .auth-form-side { padding: var(--space-6); }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = signal(true);
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.register(this.registerForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        const data = err.error?.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          applyServerValidationErrors(this.registerForm, data as Record<string, string>);
        }
        this.snackBar.open(err.error?.message || this.translate.instant('auth.register.registrationFailed'), this.translate.instant('common.close'), { duration: 4000 });
      }
    });
  }
}
