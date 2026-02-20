import { Component, signal, inject, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { BillingService } from '../../core/services/billing.service';
import { PlanDto } from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, RouterLink, TranslateModule, MatCardModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, ReactiveFormsModule
  ],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1>{{ 'settings.title' | translate }}</h1>
        <p class="header-subtitle">{{ 'settings.subtitle' | translate }}</p>
      </div>

      <div class="section-card">
        <div class="section-title">{{ 'settings.profile' | translate }}</div>
        @if (user()) {
          <div class="profile-banner">
            <div class="profile-avatar">{{ getInitials() }}</div>
            <div class="profile-meta">
              <span class="profile-name">{{ user()!.firstName }} {{ user()!.lastName }}</span>
              <span class="profile-email">{{ user()!.email }}</span>
            </div>
          </div>
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'settings.firstName' | translate }}</mat-label>
              <input matInput formControlName="firstName" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'settings.lastName' | translate }}</mat-label>
              <input matInput formControlName="lastName" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'settings.bio' | translate }}</mat-label>
              <textarea matInput formControlName="bio" rows="3" [placeholder]="'settings.bioPlaceholder' | translate"></textarea>
            </mat-form-field>
            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="saving() || profileForm.invalid">
                {{ saving() ? ('settings.saving' | translate) : ('settings.saveChanges' | translate) }}
              </button>
            </div>
          </form>
        }
      </div>

      <div class="section-card">
        <div class="section-title">{{ 'settings.subscription' | translate }}</div>
        <p class="section-desc">{{ 'settings.subscriptionSectionDesc' | translate }}</p>
        @if (plan()) {
          <div class="plan-grid">
            <div class="plan-row"><span class="plan-label">{{ 'settings.currentPlan' | translate }}</span><span class="plan-value highlight">{{ plan()!.plan }}</span></div>
            <div class="plan-row"><span class="plan-label">{{ 'settings.usage' | translate }}</span><span class="plan-value">{{ 'settings.projectsUsed' | translate: { current: plan()!.currentProjectCount, max: plan()!.maxProjects < 0 ? '∞' : plan()!.maxProjects } }}</span></div>
            <div class="plan-row"><span class="plan-label"></span><span class="plan-value muted">{{ 'settings.membersPerProject' | translate: { max: plan()!.maxMembersPerProject < 0 ? '∞' : plan()!.maxMembersPerProject } }}</span></div>
          </div>
          <div class="plan-actions">
            @if (plan()!.plan === 'FREE') {
              <a mat-flat-button color="primary" routerLink="/pricing">{{ 'settings.upgrade' | translate }}</a>
            }
            @if (plan()!.subscriptionStatus === 'active') {
              <button mat-stroked-button (click)="openPortal()" [disabled]="portalLoading()">{{ 'settings.manageBilling' | translate }}</button>
            } @else if (plan()!.plan !== 'FREE') {
              <a mat-stroked-button routerLink="/pricing">{{ 'settings.upgrade' | translate }}</a>
            }
          </div>
        } @else {
          <p class="muted">{{ 'common.loading' | translate }}</p>
        }
      </div>

      <div class="section-card">
        <div class="section-title">{{ 'settings.appearance' | translate }}</div>
        <div class="toggle-row">
          <div class="toggle-info">
            <mat-icon>dark_mode</mat-icon>
            <div>
              <span class="toggle-label">{{ 'settings.darkMode' | translate }}</span>
              <span class="toggle-desc">{{ 'settings.darkModeDesc' | translate }}</span>
            </div>
          </div>
          <mat-slide-toggle [checked]="themeService.theme() === 'dark'" (change)="themeService.toggleTheme()"></mat-slide-toggle>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">{{ 'settings.language' | translate }}</div>
        <div class="toggle-row">
          <div class="toggle-info">
            <mat-icon>language</mat-icon>
            <div>
              <span class="toggle-label">{{ 'settings.language' | translate }}</span>
              <span class="toggle-desc">{{ 'settings.languageDesc' | translate }}</span>
            </div>
          </div>
          <div class="lang-buttons">
            <button class="lang-btn" [class.active]="currentLang === 'tr'" (click)="switchLang('tr')">{{ 'settings.langTr' | translate }}</button>
            <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="switchLang('en')">{{ 'settings.langEn' | translate }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { max-width: 580px; margin: 0 auto; }

    .page-header { margin-bottom: var(--space-6); }
    .page-header h1 { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; }
    .header-subtitle { color: var(--text-tertiary); font-size: 0.875rem; margin-top: var(--space-1); }

    .section-card {
      background: var(--bg-card); border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg); padding: var(--space-6);
      margin-bottom: var(--space-4);
    }
    .section-title {
      font-size: 0.9375rem; font-weight: 600; color: var(--text-primary);
      margin-bottom: var(--space-5); padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--border-secondary);
    }
    .section-desc { font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-4); }

    .profile-banner {
      display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6);
    }
    .profile-avatar {
      width: 48px; height: 48px; border-radius: var(--radius-full);
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem; flex-shrink: 0;
    }
    .profile-meta { display: flex; flex-direction: column; gap: 1px; }
    .profile-name { font-weight: 600; font-size: 0.9375rem; color: var(--text-primary); }
    .profile-email { font-size: 0.8125rem; color: var(--text-muted); }

    .profile-form { display: flex; flex-direction: column; gap: var(--space-2); }
    .w-full { width: 100%; }
    .form-actions { margin-top: var(--space-3); }

    .plan-grid { margin-bottom: var(--space-4); }
    .plan-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-2) 0;
    }
    .plan-label { font-weight: 500; font-size: 0.8125rem; color: var(--text-primary); }
    .plan-value { font-size: 0.8125rem; color: var(--text-secondary); &.highlight { font-weight: 700; color: var(--primary); text-transform: uppercase; } &.muted { color: var(--text-muted); } }
    .plan-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }

    .toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-2) 0;
    }
    .toggle-info {
      display: flex; align-items: center; gap: var(--space-4);
      mat-icon { color: var(--text-tertiary); font-size: 22px; width: 22px; height: 22px; flex-shrink: 0; }
      div { display: flex; flex-direction: column; gap: 2px; }
    }
    .toggle-label { font-weight: 500; font-size: 0.875rem; color: var(--text-primary); }
    .toggle-desc { font-size: 0.75rem; color: var(--text-muted); }

    .lang-buttons { display: flex; gap: var(--space-2); }
    .lang-btn {
      padding: var(--space-2) var(--space-4); border-radius: var(--radius);
      border: 1px solid var(--border-primary); background: transparent;
      color: var(--text-secondary); font-size: 0.8125rem; font-weight: 500;
      cursor: pointer; transition: all var(--transition-fast);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); color: white; border-color: var(--primary); }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly billingService = inject(BillingService);

  saving = signal(false);
  portalLoading = signal(false);
  plan = signal<PlanDto | null>(null);
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
        this.profileForm.patchValue({ firstName: u.firstName, lastName: u.lastName, bio: u.bio ?? '' }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.billingService.getPlan().subscribe({
      next: (res) => res.data && this.plan.set(res.data),
      error: () => this.plan.set(null)
    });
  }

  openPortal(): void {
    this.portalLoading.set(true);
    this.billingService.getPortalSessionUrl().subscribe({
      next: (res) => { if (res.data?.url) window.open(res.data.url, '_blank'); this.portalLoading.set(false); },
      error: () => this.portalLoading.set(false)
    });
  }

  getInitials(): string {
    const u = this.user();
    if (!u) return '?';
    return ((u.firstName?.charAt(0) ?? '') + (u.lastName?.charAt(0) ?? '')).toUpperCase() || (u.email?.charAt(0)?.toUpperCase() ?? '?');
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
