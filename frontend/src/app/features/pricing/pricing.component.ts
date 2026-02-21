import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { BillingService } from '../../core/services/billing.service';
import { Plan } from '../../core/models';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pricing-page">
      <header class="pricing-topbar">
        <a routerLink="/dashboard" class="topbar-brand">
          <div class="brand-mark"><mat-icon>bolt</mat-icon></div>
          <span>CirqueTask</span>
        </a>
        <div class="topbar-actions">
          @if (authService.isAuthenticated()) {
            <a mat-button routerLink="/dashboard">{{ 'nav.dashboard' | translate }}</a>
            <a mat-button routerLink="/settings">{{ 'nav.settings' | translate }}</a>
          } @else {
            <a mat-button routerLink="/auth/login">{{ 'auth.login.signIn' | translate }}</a>
            <a mat-flat-button color="primary" routerLink="/auth/register">{{ 'auth.register.createAccount' | translate }}</a>
          }
        </div>
      </header>

      <main class="pricing-content">
        <div class="pricing-hero">
          <h1>{{ 'pricing.title' | translate }}</h1>
          <p>{{ 'pricing.subtitle' | translate }}</p>
        </div>

        <div class="plans-grid">
          <div class="plan-card">
            <div class="plan-header">
              <div class="plan-icon free"><mat-icon>rocket_launch</mat-icon></div>
              <h3>{{ 'pricing.free' | translate }}</h3>
              <p class="plan-desc">{{ 'pricing.freeDesc' | translate }}</p>
            </div>
            <div class="plan-price">
              <span class="price">$0</span>
              <span class="period">{{ 'pricing.perMonth' | translate }}</span>
            </div>
            <div class="plan-features">
              <p>{{ 'pricing.freeFeatures' | translate }}</p>
            </div>
            <div class="plan-action">
              @if (authService.isAuthenticated() && currentPlan() === 'FREE') {
                <div class="current-badge">{{ 'pricing.currentPlan' | translate }}</div>
              } @else if (!authService.isAuthenticated()) {
                <a mat-flat-button routerLink="/auth/register" class="plan-btn">{{ 'pricing.getStarted' | translate }}</a>
              }
            </div>
          </div>

          <div class="plan-card featured">
            <div class="featured-label">{{ 'pricing.popular' | translate }}</div>
            <div class="plan-header">
              <div class="plan-icon pro"><mat-icon>diamond</mat-icon></div>
              <h3>{{ 'pricing.pro' | translate }}</h3>
              <p class="plan-desc">{{ 'pricing.proDesc' | translate }}</p>
            </div>
            <div class="plan-price">
              <span class="price">$12</span>
              <span class="period">{{ 'pricing.perMonth' | translate }}</span>
            </div>
            <div class="plan-features">
              <p>{{ 'pricing.proFeatures' | translate }}</p>
            </div>
            <div class="plan-action">
              @if (authService.isAuthenticated() && currentPlan() === 'PRO') {
                <div class="current-badge">{{ 'pricing.currentPlan' | translate }}</div>
              } @else if (authService.isAuthenticated()) {
                <button mat-flat-button color="primary" class="plan-btn" [disabled]="loading()" (click)="checkout('PRO', false)">
                  {{ 'pricing.upgradeToPro' | translate }}
                </button>
              } @else {
                <a mat-flat-button color="primary" routerLink="/auth/register" class="plan-btn">{{ 'pricing.upgradeToPro' | translate }}</a>
              }
            </div>
          </div>

          <div class="plan-card">
            <div class="plan-header">
              <div class="plan-icon business"><mat-icon>corporate_fare</mat-icon></div>
              <h3>{{ 'pricing.business' | translate }}</h3>
              <p class="plan-desc">{{ 'pricing.businessDesc' | translate }}</p>
            </div>
            <div class="plan-price">
              <span class="price">$29</span>
              <span class="period">{{ 'pricing.perMonth' | translate }}</span>
            </div>
            <div class="plan-features">
              <p>{{ 'pricing.businessFeatures' | translate }}</p>
            </div>
            <div class="plan-action">
              @if (authService.isAuthenticated() && currentPlan() === 'BUSINESS') {
                <div class="current-badge">{{ 'pricing.currentPlan' | translate }}</div>
              } @else if (authService.isAuthenticated()) {
                <button mat-flat-button color="primary" class="plan-btn" [disabled]="loading()" (click)="checkout('BUSINESS', false)">
                  {{ 'pricing.upgradeToBusiness' | translate }}
                </button>
              } @else {
                <a mat-flat-button color="primary" routerLink="/auth/register" class="plan-btn">{{ 'pricing.upgradeToBusiness' | translate }}</a>
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .pricing-page { min-height: 100vh; background: var(--bg-secondary); }

    .pricing-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-3) var(--space-6);
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-primary);
      height: var(--header-height);
    }

    .topbar-brand {
      display: flex; align-items: center; gap: var(--space-3);
      text-decoration: none;
      span { font-weight: 700; font-size: 1.0625rem; color: var(--text-primary); letter-spacing: -0.02em; }
    }
    .brand-mark {
      width: 32px; height: 32px; border-radius: var(--radius);
      background: linear-gradient(135deg, #818cf8, #6366f1);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: white; }
    }

    .topbar-actions { display: flex; gap: var(--space-2); align-items: center; }

    .pricing-content {
      max-width: 1080px;
      margin: 0 auto;
      padding: var(--space-12) var(--space-6);
    }

    .pricing-hero {
      text-align: center;
      margin-bottom: var(--space-12);
      h1 {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--text-primary);
        margin-bottom: var(--space-3);
      }
      p {
        font-size: 1.0625rem;
        color: var(--text-secondary);
        max-width: 480px;
        margin: 0 auto;
      }
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
      align-items: start;
    }

    .plan-card {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      position: relative;
      transition: box-shadow var(--transition-base), transform var(--transition-base);
      &:hover { box-shadow: var(--shadow-md); }

      &.featured {
        border-color: var(--primary);
        box-shadow: var(--shadow-md);
        &:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
      }
    }

    .featured-label {
      position: absolute;
      top: -1px; right: var(--space-6);
      background: var(--primary);
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: var(--space-1) var(--space-4);
      border-radius: 0 0 var(--radius) var(--radius);
    }

    .plan-header {
      margin-bottom: var(--space-6);
      h3 { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-1); }
    }
    .plan-desc { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; }

    .plan-icon {
      width: 40px; height: 40px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: var(--space-4);
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
      &.free { background: var(--info-surface); mat-icon { color: var(--info); } }
      &.pro { background: var(--primary-surface); mat-icon { color: var(--primary); } }
      &.business { background: var(--warning-surface); mat-icon { color: var(--warning); } }
    }

    .plan-price {
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--border-primary);
      .price { font-size: 2rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
      .period { font-size: 0.875rem; color: var(--text-muted); margin-left: 2px; }
    }

    .plan-features {
      margin-bottom: var(--space-6);
      p { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.8; }
    }

    .plan-btn {
      width: 100%;
      height: 42px;
      border-radius: var(--radius) !important;
      font-weight: 600 !important;
    }

    .current-badge {
      text-align: center;
      padding: var(--space-3);
      background: var(--bg-tertiary);
      border-radius: var(--radius);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .plans-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
      .pricing-content { padding: var(--space-8) var(--space-4); }
    }
  `]
})
export class PricingComponent {
  readonly authService = inject(AuthService);
  private readonly billingService = inject(BillingService);

  loading = signal(false);
  currentPlan = signal<Plan>('FREE');

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.billingService.getPlan().subscribe({
        next: (res) => res.data && this.currentPlan.set(res.data.plan),
        error: () => {}
      });
    }
  }

  checkout(plan: 'PRO' | 'BUSINESS', yearly: boolean): void {
    this.loading.set(true);
    this.billingService.createCheckoutSession(plan, yearly).subscribe({
      next: (res) => {
        if (res.data?.url) window.location.href = res.data.url;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
