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
    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="brand" routerLink="/dashboard">
            <mat-icon class="brand-icon">bolt</mat-icon>
            @if (!sidebarCollapsed()) {
              <span class="brand-name">CirqueTask</span>
            }
          </div>
          <button mat-icon-button class="collapse-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" [matTooltip]="sidebarCollapsed() ? ('nav.dashboard' | translate) : ''">
            <mat-icon>dashboard</mat-icon>
            @if (!sidebarCollapsed()) { <span>{{ 'nav.dashboard' | translate }}</span> }
          </a>
          <a class="nav-item" routerLink="/projects" routerLinkActive="active" [matTooltip]="sidebarCollapsed() ? ('nav.projects' | translate) : ''">
            <mat-icon>folder</mat-icon>
            @if (!sidebarCollapsed()) { <span>{{ 'nav.projects' | translate }}</span> }
          </a>
          <a class="nav-item" routerLink="/notifications" routerLinkActive="active" [matTooltip]="sidebarCollapsed() ? ('nav.notifications' | translate) : ''">
            <mat-icon [attr.aria-hidden]="false" [matBadge]="notificationService.unreadCount() > 0 ? notificationService.unreadCount() : null" matBadgeSize="small" matBadgeColor="warn">notifications</mat-icon>
            @if (!sidebarCollapsed()) { <span>{{ 'nav.notifications' | translate }}</span> }
          </a>

          @if (projects().length > 0) {
            <div class="nav-section">
              @if (!sidebarCollapsed()) {
                <span class="nav-section-title">{{ 'nav.myProjects' | translate }}</span>
              }
              <mat-divider></mat-divider>
            </div>

            @for (project of projects(); track project.id) {
              <a class="nav-item project-item" [routerLink]="['/projects', project.id]" routerLinkActive="active">
                <span class="project-dot" [style.background]="project.color"></span>
                @if (!sidebarCollapsed()) {
                  <span class="truncate">{{ project.name }}</span>
                }
              </a>
            }
          }
        </nav>

        <div class="sidebar-footer">
          <a class="nav-item" routerLink="/settings" routerLinkActive="active" [matTooltip]="sidebarCollapsed() ? ('nav.settings' | translate) : ''">
            <mat-icon>settings</mat-icon>
            @if (!sidebarCollapsed()) { <span>{{ 'nav.settings' | translate }}</span> }
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-wrapper">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <button mat-icon-button class="mobile-menu" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
              <mat-icon>menu</mat-icon>
            </button>
          </div>

          <div class="header-right">
            <button mat-icon-button [matTooltip]="themeService.isDark() ? ('nav.lightMode' | translate) : ('nav.darkMode' | translate)" (click)="themeService.toggleTheme()">
              <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

            <button mat-icon-button routerLink="/notifications"
              [matBadge]="notificationService.unreadCount() > 0 ? notificationService.unreadCount() : null"
              matBadgeSize="small" matBadgeColor="warn">
              <mat-icon [attr.aria-hidden]="false">notifications_none</mat-icon>
            </button>

            <button [matMenuTriggerFor]="userMenu" class="avatar-btn">
              {{ getInitials() }}
            </button>

            <mat-menu #userMenu="matMenu" xPosition="before">
              <div class="user-menu-header">
                <strong>{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</strong>
                <small>{{ authService.currentUser()?.email }}</small>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/settings">
                <mat-icon>person</mat-icon>
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

        <!-- Page Content -->
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; height: 100vh; overflow: hidden; }

    // Sidebar
    .sidebar {
      width: var(--sidebar-width); min-width: var(--sidebar-width);
      background: var(--bg-sidebar); color: var(--sidebar-text);
      display: flex; flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 100;
      &.collapsed { width: 68px; min-width: 68px; }
    }
    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px; height: var(--header-height);
    }
    .brand {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      .brand-icon { color: #a78bfa; font-size: 28px; width: 28px; height: 28px; min-width: 28px; overflow: hidden; }
      .brand-name { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.5px; color: white; }
    }
    .collapse-btn { color: var(--sidebar-text); opacity: 0.6; &:hover { opacity: 1; } }

    .sidebar-nav { flex: 1; padding: 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 8px;
      color: var(--sidebar-text); opacity: 0.7;
      cursor: pointer; transition: all 0.2s;
      font-size: 0.9rem; font-weight: 500; white-space: nowrap;
      min-width: 0;
      mat-icon { width: 24px; min-width: 24px; height: 24px; flex-shrink: 0; }
      > span:not(.project-dot) { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
      &:hover { opacity: 1; background: var(--sidebar-active); }
      &.active { opacity: 1; background: var(--sidebar-active); color: white; }
    }
    .project-item { padding-left: 16px; }
    .project-item .truncate { min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
    .project-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .nav-section { padding: 16px 12px 4px; }
    .nav-section-title { font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; opacity: 0.5; }
    .sidebar-footer { padding: 8px; border-top: 1px solid rgba(255,255,255,0.08); }

    // Main
    .main-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    .header {
      height: var(--header-height); min-height: var(--header-height);
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px;
    }
    .header-right { display: flex; align-items: center; gap: 8px; }
    .mobile-menu { display: none; }
    .avatar-btn {
      width: 36px; height: 36px;
      border-radius: 50%; border: none;
      padding: 0; margin: 0;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white; cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.75rem; font-weight: 700;
      line-height: 36px; text-align: center;
      box-sizing: border-box;
    }
    .user-menu-header {
      padding: 12px 16px;
      strong { display: block; }
      small { color: var(--text-muted); }
    }

    .content {
      flex: 1; overflow-y: auto;
      padding: 24px;
      background: var(--bg-secondary);
    }

    @media (max-width: 768px) {
      .sidebar { position: fixed; left: -280px; height: 100%; &.collapsed { left: 0; width: var(--sidebar-width); min-width: var(--sidebar-width); } }
      .mobile-menu { display: inline-flex; }
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
