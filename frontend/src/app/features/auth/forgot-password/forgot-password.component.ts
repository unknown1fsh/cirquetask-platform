import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { applyServerValidationErrors } from '../../../core/utils/form.util';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-right single">
        <div class="auth-form-wrapper">
          <h2>{{ 'auth.forgotPassword.title' | translate }}</h2>
          <p class="subtitle">{{ 'auth.forgotPassword.subtitle' | translate }}</p>

          @if (!sent()) {
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>{{ 'auth.login.email' | translate }}</mat-label>
                <input matInput formControlName="email" type="email" [placeholder]="'auth.login.emailPlaceholder' | translate">
                <mat-icon matPrefix>email</mat-icon>
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>{{ 'auth.login.emailRequired' | translate }}</mat-error>
                }
                @if (form.get('email')?.hasError('email')) {
                  <mat-error>{{ 'auth.login.emailInvalid' | translate }}</mat-error>
                }
                @if (form.get('email')?.hasError('serverError')) {
                  <mat-error>{{ form.get('email')?.getError('serverError') }}</mat-error>
                }
              </mat-form-field>

              <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'auth.forgotPassword.submit' | translate }}
                }
              </button>
            </form>
          } @else {
            <p class="success-msg">{{ 'auth.forgotPassword.success' | translate }}</p>
          }

          <p class="auth-link">
            <a routerLink="/auth/login">{{ 'auth.forgotPassword.backToLogin' | translate }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); }
    .auth-right.single {
      flex: 1;
      max-width: 420px;
      padding: 48px 24px;
      background: var(--bg-primary);
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
    }
    .auth-form-wrapper { width: 100%; }
    .auth-form-wrapper h2 { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
    .subtitle { color: var(--text-secondary); margin-bottom: 24px; }
    form { display: flex; flex-direction: column; gap: 4px; }
    .submit-btn { width: 100%; height: 48px; font-size: 1rem; font-weight: 600; border-radius: 12px; margin-top: 8px; }
    .success-msg { color: var(--text-secondary); margin: 24px 0; padding: 16px; background: var(--bg-tertiary); border-radius: 12px; }
    .auth-link { text-align: center; margin-top: 24px; a { color: var(--primary); font-weight: 600; } }
    .w-full { width: 100%; }
    .mat-icon { width: 24px; min-width: 24px; height: 24px; flex-shrink: 0; overflow: hidden; }
  `]
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = signal(false);
  sent = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
        this.snackBar.open(
          this.translate.instant('auth.forgotPassword.success'),
          this.translate.instant('common.close'),
          { duration: 5000 }
        );
      },
      error: (err) => {
        this.loading.set(false);
        const data = err.error?.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          applyServerValidationErrors(this.form, data as Record<string, string>);
        } else {
          this.sent.set(true);
          this.snackBar.open(
            this.translate.instant('auth.forgotPassword.success'),
            this.translate.instant('common.close'),
            { duration: 5000 }
          );
        }
      }
    });
  }
}
