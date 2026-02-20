import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1>{{ 'settings.title' | translate }}</h1>
        <p class="text-muted">{{ 'settings.subtitle' | translate }}</p>
      </div>

      <!-- Profile Section -->
      <div class="cirquetask-card profile-section">
        <h2>{{ 'settings.profile' | translate }}</h2>
        @if (user()) {
          <div class="profile-info">
            <div class="avatar">{{ getInitials() }}</div>
            <div class="user-details">
              <span class="user-name">{{ user()!.firstName }} {{ user()!.lastName }}</span>
              <span class="user-email text-muted">{{ user()!.email }}</span>
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'settings.firstName' | translate }}</mat-label>
              <input matInput formControlName="firstName" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'settings.lastName' | translate }}</mat-label>
              <input matInput formControlName="lastName" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'settings.bio' | translate }}</mat-label>
              <textarea matInput formControlName="bio" rows="3" [placeholder]="'settings.bioPlaceholder' | translate"></textarea>
            </mat-form-field>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="saving() || profileForm.invalid">
                @if (saving()) {
                  {{ 'settings.saving' | translate }}
                } @else {
                  {{ 'settings.saveChanges' | translate }}
                }
              </button>
            </div>
          </form>
        }
      </div>

      <!-- Theme Section -->
      <div class="cirquetask-card theme-section">
        <h2>{{ 'settings.appearance' | translate }}</h2>
        <div class="theme-toggle-row">
          <div class="theme-info">
            <mat-icon>dark_mode</mat-icon>
            <div>
              <span class="theme-label">{{ 'settings.darkMode' | translate }}</span>
              <span class="text-muted">{{ 'settings.darkModeDesc' | translate }}</span>
            </div>
          </div>
          <mat-slide-toggle
            [checked]="themeService.theme() === 'dark'"
            (change)="themeService.toggleTheme()"
          ></mat-slide-toggle>
        </div>

        <!-- Language Section -->
        <div class="cirquetask-card language-section">
          <h2>{{ 'settings.language' | translate }}</h2>
          <div class="language-row">
            <div class="language-info">
              <mat-icon>language</mat-icon>
              <div>
                <span class="language-label">{{ 'settings.language' | translate }}</span>
                <span class="text-muted">{{ 'settings.languageDesc' | translate }}</span>
              </div>
            </div>
            <div class="language-buttons">
              <button mat-stroked-button [class.active-lang]="currentLang === 'tr'" (click)="switchLang('tr')">{{ 'settings.langTr' | translate }}</button>
              <button mat-stroked-button [class.active-lang]="currentLang === 'en'" (click)="switchLang('en')">{{ 'settings.langEn' | translate }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { max-width: 600px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .page-header p { margin-top: 4px; }

    .profile-section, .theme-section { margin-bottom: 24px; }
    .profile-section h2, .theme-section h2 {
      font-size: 1rem; font-weight: 600; color: var(--text-primary);
      margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);
    }

    .profile-info {
      display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
    }
    .avatar {
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--primary); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.25rem;
    }
    .user-details { display: flex; flex-direction: column; gap: 2px; }
    .user-name { font-weight: 600; color: var(--text-primary); }
    .user-email { font-size: 0.875rem; }

    .profile-form { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
    .form-actions { margin-top: 16px; }

    .theme-toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 0;
    }
    .theme-info {
      display: flex; align-items: center; gap: 16px;
      mat-icon { color: var(--text-secondary); width: 24px; min-width: 24px; height: 24px; flex-shrink: 0; }
      div { display: flex; flex-direction: column; gap: 2px; }
    }
    .theme-label { font-weight: 500; color: var(--text-primary); }

    .language-section { margin-bottom: 24px; }
    .language-section h2 {
      font-size: 1rem; font-weight: 600; color: var(--text-primary);
      margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);
    }
    .language-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 0;
    }
    .language-info {
      display: flex; align-items: center; gap: 16px;
      mat-icon { color: var(--text-secondary); width: 24px; min-width: 24px; height: 24px; flex-shrink: 0; }
      div { display: flex; flex-direction: column; gap: 2px; }
    }
    .language-label { font-weight: 500; color: var(--text-primary); }
    .language-buttons { display: flex; gap: 8px; }
    .active-lang { background: var(--primary) !important; color: white !important; }
  `]
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  saving = signal(false);
  currentLang = this.translate.currentLang || this.translate.defaultLang || 'tr';

  user = this.authService.currentUser;

  profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    bio: ['']
  });

  constructor() {
    effect(() => {
      const u = this.authService.currentUser();
      if (u) {
        this.profileForm.patchValue({
          firstName: u.firstName,
          lastName: u.lastName,
          bio: u.bio ?? ''
        }, { emitEvent: false });
      }
    });
  }

  getInitials(): string {
    const u = this.user();
    if (!u) return '?';
    const first = u.firstName?.charAt(0) ?? '';
    const last = u.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || (u.email?.charAt(0)?.toUpperCase() ?? '?');
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.saving.set(true);
    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false)
    });
  }

  switchLang(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    document.documentElement.lang = lang;
  }
}
