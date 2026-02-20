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
          <h2>{{ 'auth.resetPassword.title' | translate }}</h2>
          <p class="subtitle">{{ 'auth.resetPassword.subtitle' | translate }}</p>

          @if (!token()) {
            <p class="error-msg">{{ 'auth.resetPassword.invalidToken' | translate }}</p>
            <p class="auth-link"><a routerLink="/auth/login">{{ 'auth.forgotPassword.backToLogin' | translate }}</a></p>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>{{ 'auth.resetPassword.newPassword' | translate }}</mat-label>
                <input matInput formControlName="newPassword" [type]="hidePassword() ? 'password' : 'text'">
                <mat-icon matPrefix>lock</mat-icon>
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
                <mat-icon matPrefix>lock</mat-icon>
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
            <p class="auth-link"><a routerLink="/auth/login">{{ 'auth.forgotPassword.backToLogin' | translate }}</a></p>
          }
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
    .error-msg { color: var(--warn); margin: 16px 0; }
    .auth-link { text-align: center; margin-top: 24px; a { color: var(--primary); font-weight: 600; } }
    .w-full { width: 100%; }
    .mat-icon { width: 24px; min-width: 24px; height: 24px; flex-shrink: 0; overflow: hidden; }
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
