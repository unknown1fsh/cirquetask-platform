import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { applyServerValidationErrors } from '../../../core/utils/form.util';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatInputModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, TranslateModule
  ],
  template: `
    <div class="auth-page-centered">
      <div class="auth-card">
        <div class="card-brand">
          <div class="logo-mark"><mat-icon>bolt</mat-icon></div>
          <span>CirqueTask</span>
        </div>

        <div class="form-header">
          <h2>{{ 'auth.resetPassword.title' | translate }}</h2>
          <p>{{ 'auth.resetPassword.subtitle' | translate }}</p>
        </div>

        @if (!token()) {
          <div class="error-state">
            <mat-icon>error_outline</mat-icon>
            <p>{{ 'auth.resetPassword.invalidToken' | translate }}</p>
          </div>
          <div class="auth-footer">
            <a routerLink="/auth/login">
              <mat-icon>arrow_back</mat-icon>
              {{ 'auth.forgotPassword.backToLogin' | translate }}
            </a>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'auth.resetPassword.newPassword' | translate }}</mat-label>
              <input matInput formControlName="newPassword" [type]="hidePassword() ? 'password' : 'text'">
              <mat-icon matPrefix>lock_outline</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('newPassword')?.hasError('required') && form.get('newPassword')?.touched) {
                <mat-error>{{ 'auth.login.passwordRequired' | translate }}</mat-error>
              }
              @if (form.get('newPassword')?.hasError('minlength')) {
                <mat-error>{{ 'auth.register.passwordMinLength' | translate }}</mat-error>
              }
              @if (form.get('newPassword')?.hasError('serverError')) {
                <mat-error>{{ form.get('newPassword')?.getError('serverError') }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'auth.resetPassword.confirmPassword' | translate }}</mat-label>
              <input matInput formControlName="confirmPassword" type="password">
              <mat-icon matPrefix>lock_outline</mat-icon>
              @if (form.get('confirmPassword')?.touched && form.hasError('mismatch')) {
                <mat-error>{{ 'auth.resetPassword.passwordMismatch' | translate }}</mat-error>
              }
              @if (form.get('confirmPassword')?.hasError('serverError')) {
                <mat-error>{{ form.get('confirmPassword')?.getError('serverError') }}</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="loading() || form.invalid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'auth.resetPassword.submit' | translate }}
              }
            </button>
          </form>

          <div class="auth-footer">
            <a routerLink="/auth/login">
              <mat-icon>arrow_back</mat-icon>
              {{ 'auth.forgotPassword.backToLogin' | translate }}
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page-centered {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--bg-secondary); padding: var(--space-6);
    }

    .auth-card {
      width: 100%; max-width: 420px;
      background: var(--bg-card); border-radius: var(--radius-xl);
      border: 1px solid var(--border-primary);
      padding: var(--space-10); box-shadow: var(--shadow-lg);
    }

    .card-brand {
      display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-8);
      span { font-weight: 700; font-size: 1.0625rem; color: var(--text-primary); letter-spacing: -0.02em; }
    }
    .logo-mark {
      width: 36px; height: 36px; border-radius: var(--radius);
      background: linear-gradient(135deg, #818cf8, #6366f1);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: white; }
    }

    .form-header {
      margin-bottom: var(--space-6);
      h2 { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-2); }
      p { color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5; }
    }

    form { display: flex; flex-direction: column; gap: var(--space-1); }
    .submit-btn { width: 100%; height: 44px; font-size: 0.9375rem; font-weight: 600; border-radius: var(--radius) !important; }

    .error-state {
      text-align: center; padding: var(--space-6) 0;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--danger); margin-bottom: var(--space-3); }
      p { color: var(--text-secondary); }
    }

    .auth-footer {
      text-align: center; margin-top: var(--space-6);
      a {
        display: inline-flex; align-items: center; gap: var(--space-1);
        color: var(--text-secondary); font-size: 0.875rem; font-weight: 500;
        &:hover { color: var(--primary); }
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token = signal<string | null>(null);
  loading = signal(false);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.form = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['']
      },
      { validators: (g) => (g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true }) }
    );
  }

  ngOnInit(): void {
    const t = this.route.snapshot.queryParamMap.get('token');
    this.token.set(t);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token()) return;
    this.loading.set(true);
    this.auth.resetPassword(this.token()!, this.form.value.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('auth.resetPassword.success'),
          this.translate.instant('common.close'),
          { duration: 4000 }
        );
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const data = err.error?.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          applyServerValidationErrors(this.form, data as Record<string, string>);
        }
        this.snackBar.open(
          err.error?.message || this.translate.instant('auth.resetPassword.failed'),
          this.translate.instant('common.close'),
          { duration: 5000 }
        );
      }
    });
  }
}
