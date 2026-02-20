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
    <div class="auth-container">
      <div class="auth-left">
        <div class="brand">
          <div class="logo">
            <mat-icon class="logo-icon">bolt</mat-icon>
          </div>
          <h1>CirqueTask</h1>
          <p>{{ 'auth.register.brandSubtitle' | translate }}</p>
        </div>
        <div class="stats">
          <div class="stat"><strong>10K+</strong><span>{{ 'auth.register.statTeams' | translate }}</span></div>
          <div class="stat"><strong>50K+</strong><span>{{ 'auth.register.statProjects' | translate }}</span></div>
          <div class="stat"><strong>1M+</strong><span>{{ 'auth.register.statTasks' | translate }}</span></div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2>{{ 'auth.register.title' | translate }}</h2>
          <p class="subtitle">{{ 'auth.register.subtitle' | translate }}</p>

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
              <mat-icon matPrefix>email</mat-icon>
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
              <mat-icon matPrefix>lock</mat-icon>
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

          <p class="auth-link">
            {{ 'auth.register.hasAccount' | translate }} <a routerLink="/auth/login">{{ 'auth.register.signIn' | translate }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; min-height: 100vh; }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%);
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      padding: 48px; color: white;
    }
    .brand { text-align: center; margin-bottom: 48px; }
    .logo {
      width: 80px; height: 80px;
      background: rgba(255,255,255,0.2); border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; backdrop-filter: blur(10px);
    }
    .logo-icon { font-size: 40px; width: 40px; height: 40px; overflow: hidden; }
    .brand h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; }
    .brand p { opacity: 0.8; margin-top: 8px; font-size: 1.1rem; }
    .stats { display: flex; gap: 32px; }
    .stat {
      text-align: center;
      strong { display: block; font-size: 1.5rem; font-weight: 800; }
      span { font-size: 0.875rem; opacity: 0.8; }
    }
    .auth-right {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: var(--bg-primary); padding: 48px;
    }
    .auth-form-wrapper { width: 100%; max-width: 420px; }
    .auth-form-wrapper h2 { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
    .subtitle { color: var(--text-secondary); margin-bottom: 32px; }
    form { display: flex; flex-direction: column; gap: 4px; }
    .name-row { display: flex; gap: 12px; }
    .name-row mat-form-field { flex: 1; }
    .submit-btn { width: 100%; height: 48px; font-size: 1rem; font-weight: 600; border-radius: 12px; margin-top: 8px; }
    .auth-link { text-align: center; margin-top: 24px; color: var(--text-secondary); a { color: var(--primary); font-weight: 600; } }
    @media (max-width: 768px) { .auth-left { display: none; } .auth-right { padding: 24px; } }
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
