import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../core/services/notification.service';
import { Notification, NotificationType } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <div>
          <h1>{{ 'notifications.title' | translate }}</h1>
          <p class="header-subtitle">{{ 'notifications.subtitle' | translate }}</p>
        </div>
        @if (notifications().length && hasUnread()) {
          <button mat-stroked-button (click)="markAllRead()">
            <mat-icon>done_all</mat-icon>
            {{ 'notifications.markAllRead' | translate }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="40"></mat-spinner><p>{{ 'notifications.loadingNotifications' | translate }}</p></div>
      } @else if (notifications().length) {
        <div class="notif-card">
          @for (notification of notifications(); track notification.id) {
            <div class="notif-row" [class.unread]="!notification.isRead" (click)="markAsRead(notification)">
              <div class="notif-icon" [class]="'t-' + notification.type.toLowerCase()">
                <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
              </div>
              <div class="notif-body">
                <span class="notif-title">{{ notification.title }}</span>
                <p class="notif-msg">{{ notification.message }}</p>
                <span class="notif-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
              @if (!notification.isRead) {
                <span class="unread-dot"></span>
              }
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon"><mat-icon>notifications_none</mat-icon></div>
          <p class="empty-title">{{ 'notifications.noNotifications' | translate }}</p>
          <span class="empty-desc">{{ 'notifications.allCaughtUp' | translate }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-page { max-width: 680px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4);
    }
    .page-header h1 { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; }
    .header-subtitle { color: var(--text-tertiary); font-size: 0.875rem; margin-top: var(--space-1); }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-16); color: var(--text-muted); gap: var(--space-4);
    }

    .notif-card {
      background: var(--bg-card); border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg); overflow: hidden;
    }

    .notif-row {
      display: flex; gap: var(--space-4); padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--border-secondary);
      cursor: pointer; transition: background var(--transition-fast);
      position: relative;
      &:last-child { border-bottom: none; }
      &:hover { background: var(--hover-bg); }
      &.unread { background: var(--primary-surface); }
    }

    .notif-icon {
      width: 36px; min-width: 36px; height: 36px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: white; }
      &.t-task_assigned { background: #3b82f6; }
      &.t-task_updated { background: #f59e0b; }
      &.t-comment_added { background: #8b5cf6; }
      &.t-member_added { background: #10b981; }
      &.t-project_updated { background: #6366f1; }
      &.t-mention { background: #ec4899; }
      &.t-deadline_approaching { background: #ef4444; }
    }

    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-weight: 600; font-size: 0.8125rem; color: var(--text-primary); display: block; margin-bottom: 2px; }
    .notif-msg { font-size: 0.8125rem; color: var(--text-secondary); margin: 0 0 4px; line-height: 1.4; }
    .notif-time { font-size: 0.6875rem; color: var(--text-muted); }

    .unread-dot {
      width: 8px; height: 8px; min-width: 8px; border-radius: 50%;
      background: var(--primary); flex-shrink: 0; align-self: center;
    }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-16) var(--space-6); text-align: center;
      background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-lg);
    }
    .empty-icon {
      width: 64px; height: 64px; border-radius: var(--radius-xl); background: var(--bg-tertiary);
      display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-5);
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: var(--text-muted); }
    }
    .empty-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-2); }
    .empty-desc { font-size: 0.875rem; color: var(--text-secondary); }
  `]
})
export class NotificationsComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly notificationService = inject(NotificationService);

  loading = signal(true);
  notifications = signal<Notification[]>([]);

  ngOnInit(): void { this.loadNotifications(); }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (res) => { if (res.success) this.notifications.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  hasUnread(): boolean { return this.notifications().some(n => !n.isRead); }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => { this.notifications.update(list => list.map(n => n.id === notification.id ? { ...n, isRead: true } : n)); }
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => { this.notifications.update(list => list.map(n => ({ ...n, isRead: true }))); }
    });
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<string, string> = {
      TASK_ASSIGNED: 'person_add', TASK_UPDATED: 'edit', COMMENT_ADDED: 'chat_bubble_outline',
      MEMBER_ADDED: 'group_add', PROJECT_UPDATED: 'folder', MENTION: 'alternate_email',
      DEADLINE_APPROACHING: 'schedule'
    };
    return icons[type] || 'notifications';
  }

  formatTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return this.translate.instant('common.timeAgo.justNow');
    if (min < 60) return this.translate.instant('common.timeAgo.minutes', { count: min });
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return this.translate.instant('common.timeAgo.hours', { count: hrs });
    const days = Math.floor(hrs / 24);
    if (days < 7) return this.translate.instant('common.timeAgo.days', { count: days });
    const localeMap: Record<string, string> = { tr: 'tr-TR', en: 'en-US' };
    return new Date(dateStr).toLocaleDateString(localeMap[this.translate.currentLang] || 'en-US');
  }
}
