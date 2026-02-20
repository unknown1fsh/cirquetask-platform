import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../core/auth/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { NotificationService } from '../core/services/notification.service';
import { ProjectService } from '../core/services/project.service';
import { Project } from '../core/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule,
    MatBadgeModule, MatMenuModule, MatDividerModule, MatTooltipModule, TranslateModule
  ],
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-brand">
          <a class="brand" routerLink="/dashboard">
            <div class="brand-mark">
              <mat-icon>bolt</mat-icon>
            </div>
            @if (!sidebarCollapsed()) {
              <span class="brand-text">CirqueTask</span>
            }
          </a>
          <button class="collapse-toggle" (click)="sidebarCollapsed.set(!sidebarCollapsed())"
                  [matTooltip]="sidebarCollapsed() ? 'Expand' : 'Collapse'" matTooltipPosition="right">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <a class="nav-link" routerLink="/dashboard" routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: true}"
               [matTooltip]="sidebarCollapsed() ? ('nav.dashboard' | translate) : ''" matTooltipPosition="right">
              <mat-icon>space_dashboard</mat-icon>
              @if (!sidebarCollapsed()) { <span>{{ 'nav.dashboard' | translate }}</span> }
            </a>
            <a class="nav-link" routerLink="/projects" routerLinkActive="active"
               [matTooltip]="sidebarCollapsed() ? ('nav.projects' | translate) : ''" matTooltipPosition="right">
              <mat-icon>folder_open</mat-icon>
              @if (!sidebarCollapsed()) { <span>{{ 'nav.projects' | translate }}</span> }
            </a>
            <a class="nav-link" routerLink="/notifications" routerLinkActive="active"
               [matTooltip]="sidebarCollapsed() ? ('nav.notifications' | translate) : ''" matTooltipPosition="right">
              <mat-icon [matBadge]="notificationService.unreadCount() > 0 ? notificationService.unreadCount() : null"
                        matBadgeSize="small" matBadgeColor="warn">notifications_none</mat-icon>
              @if (!sidebarCollapsed()) { <span>{{ 'nav.notifications' | translate }}</span> }
            </a>
          </div>

          @if (projects().length > 0 && !sidebarCollapsed()) {
            <div class="nav-divider">
              <span class="nav-section-label">{{ 'nav.myProjects' | translate }}</span>
            </div>
            <div class="nav-group project-list">
              @for (project of projects(); track project.id) {
                <a class="nav-link project-link" [routerLink]="['/projects', project.id]" routerLinkActive="active">
                  <span class="project-indicator" [style.background]="project.color"></span>
                  <span class="project-name">{{ project.name }}</span>
                </a>
              }
            </div>
          }
        </nav>

        <div class="sidebar-bottom">
          <a class="nav-link" routerLink="/pricing" routerLinkActive="active"
             [matTooltip]="sidebarCollapsed() ? ('nav.pricing' | translate) : ''" matTooltipPosition="right">
            <mat-icon>diamond</mat-icon>
            @if (!sidebarCollapsed()) { <span>{{ 'nav.pricing' | translate }}</span> }
          </a>
          <a class="nav-link" routerLink="/settings" routerLinkActive="active"
             [matTooltip]="sidebarCollapsed() ? ('nav.settings' | translate) : ''" matTooltipPosition="right">
            <mat-icon>settings</mat-icon>
            @if (!sidebarCollapsed()) { <span>{{ 'nav.settings' | translate }}</span> }
          </a>
        </div>
      </aside>

      <div class="main-area">
        <header class="topbar">
          <button class="mobile-trigger" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="topbar-spacer"></div>
          <div class="topbar-actions">
            <button class="action-btn" (click)="themeService.toggleTheme()"
                    [matTooltip]="themeService.isDark() ? ('nav.lightMode' | translate) : ('nav.darkMode' | translate)">
              <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
            <button class="action-btn" routerLink="/notifications"
                    [matBadge]="notificationService.unreadCount() > 0 ? notificationService.unreadCount() : null"
                    matBadgeSize="small" matBadgeColor="warn">
              <mat-icon>notifications_none</mat-icon>
            </button>
            <button class="avatar-btn" [matMenuTriggerFor]="userMenu">
              {{ getInitials() }}
            </button>
            <mat-menu #userMenu="matMenu" xPosition="before">
              <div class="user-menu-info">
                <div class="user-menu-name">{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</div>
                <div class="user-menu-email">{{ authService.currentUser()?.email }}</div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/settings">
                <mat-icon>person_outline</mat-icon>
                <span>{{ 'nav.profile' | translate }}</span>
              </button>
              <button mat-menu-item routerLink="/settings">
                <mat-icon>settings</mat-icon>
                <span>{{ 'nav.settings' | translate }}</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="authService.logout()">
                <mat-icon>logout</mat-icon>
                <span>{{ 'nav.signOut' | translate }}</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-secondary);
    }

    // ── Sidebar ──
    .sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      background: var(--bg-sidebar);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-slow), min-width var(--transition-slow);
      z-index: var(--z-sidebar);
      overflow: hidden;

      &.collapsed {
        width: var(--sidebar-collapsed-width);
        min-width: var(--sidebar-collapsed-width);
      }
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-3);
      height: var(--header-height);
      flex-shrink: 0;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      cursor: pointer;
      text-decoration: none;
    }

    .brand-mark {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: var(--radius);
      background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon {
        color: white;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .brand-text {
      font-size: 1.0625rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: white;
      white-space: nowrap;
    }

    .collapse-toggle {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-sidebar);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast), color var(--transition-fast);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: var(--bg-sidebar-hover); color: white; }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--space-2) var(--space-2);
      display: flex;
      flex-direction: column;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 7px 10px;
      border-radius: var(--radius-sm);
      color: var(--text-sidebar);
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
      font-size: 0.8125rem;
      font-weight: 500;
      white-space: nowrap;
      text-decoration: none;
      min-height: 34px;

      mat-icon {
        width: 20px !important;
        min-width: 20px !important;
        height: 20px !important;
        font-size: 20px !important;
        flex-shrink: 0;
      }

      span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

      &:hover {
        background: var(--bg-sidebar-hover);
        color: var(--text-sidebar-active);
      }

      &.active {
        background: var(--bg-sidebar-active);
        color: var(--text-sidebar-active);
        font-weight: 600;
      }
    }

    .nav-divider {
      padding: var(--space-5) var(--space-3) var(--space-2);
    }

    .nav-section-label {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.35);
    }

    .project-list {
      max-height: 240px;
      overflow-y: auto;
    }

    .project-link {
      padding-left: var(--space-3);
    }

    .project-indicator {
      width: 8px;
      height: 8px;
      min-width: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .project-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sidebar-bottom {
      flex-shrink: 0;
      padding: var(--space-2);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    // ── Main Area ──
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .topbar {
      height: var(--header-height);
      min-height: var(--header-height);
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-primary);
      display: flex;
      align-items: center;
      padding: 0 var(--space-5);
      gap: var(--space-3);
      flex-shrink: 0;
    }

    .topbar-spacer { flex: 1; }

    .mobile-trigger {
      display: none;
      width: 36px;
      height: 36px;
      border-radius: var(--radius);
      border: 1px solid var(--border-primary);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .action-btn {
      width: 34px;
      height: 34px;
      border-radius: var(--radius);
      border: none;
      background: transparent;
      color: var(--text-tertiary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast), color var(--transition-fast);
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover { background: var(--hover-bg); color: var(--text-primary); }
    }

    .avatar-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      border: none;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.6875rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: var(--space-1);
      transition: opacity var(--transition-fast);
      &:hover { opacity: 0.9; }
    }

    .user-menu-info {
      padding: var(--space-3) var(--space-4);
    }
    .user-menu-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-primary);
    }
    .user-menu-email {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-6) var(--space-8);
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100%;
        transform: translateX(-100%);
        transition: transform var(--transition-slow);
        width: var(--sidebar-width) !important;
        min-width: var(--sidebar-width) !important;
        &.collapsed { transform: translateX(0); }
      }
      .mobile-trigger { display: flex; }
      .page-content { padding: var(--space-4); }
    }
  `]
})
export class LayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);
  projects = signal<Project[]>([]);

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    public notificationService: NotificationService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.notificationService.getUnreadCount().subscribe();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (res) => {
        if (res.success) {
          this.projects.set(res.data);
        }
      }
    });
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }
}
