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
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <div>
          <h1>{{ 'notifications.title' | translate }}</h1>
          <p class="text-muted">{{ 'notifications.subtitle' | translate }}</p>
        </div>
        @if (notifications().length && hasUnread()) {
          <button mat-stroked-button (click)="markAllRead()">
            <mat-icon>done_all</mat-icon>
            {{ 'notifications.markAllRead' | translate }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>{{ 'notifications.loadingNotifications' | translate }}</p>
        </div>
      } @else if (notifications().length) {
        <div class="notifications-list cirquetask-card">
          @for (notification of notifications(); track notification.id) {
            <div
              class="notification-row"
              [class.unread]="!notification.isRead"
              (click)="markAsRead(notification)"
            >
              <div class="notification-icon" [class]="'type-' + notification.type.toLowerCase()">
                <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
              </div>
              <div class="notification-content">
                <span class="notification-title">{{ notification.title }}</span>
                <p class="notification-message">{{ notification.message }}</p>
                <small class="text-muted">{{ formatTime(notification.createdAt) }}</small>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state cirquetask-card">
          <mat-icon>notifications_none</mat-icon>
          <p>{{ 'notifications.noNotifications' | translate }}</p>
          <span class="text-muted">{{ 'notifications.allCaughtUp' | translate }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-page { max-width: 700px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
    }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .page-header p { margin-top: 4px; }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 64px; color: var(--text-muted);
      mat-spinner { margin-bottom: 16px; }
    }

    .notifications-list { padding: 0; overflow: hidden; }
    .notification-row {
      display: flex; gap: 16px; padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer; transition: background 0.15s ease;
      &:last-child { border-bottom: none; }
      &:hover { background: var(--hover-bg); }
      &.unread { background: rgba(99, 102, 241, 0.05); }
    }
    .notification-icon {
      width: 40px; min-width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
      mat-icon { font-size: 22px; width: 22px; min-width: 22px; height: 22px; color: white; }
    }
    .notification-icon.type-task_assigned { background: #3b82f6; }
    .notification-icon.type-task_updated { background: #f59e0b; }
    .notification-icon.type-comment_added { background: #8b5cf6; }
    .notification-icon.type-member_added { background: #22c55e; }
    .notification-icon.type-project_updated { background: #6366f1; }
    .notification-icon.type-mention { background: #ec4899; }
    .notification-icon.type-deadline_approaching { background: #ef4444; }

    .notification-content {
      flex: 1; min-width: 0;
      .notification-title { font-weight: 600; color: var(--text-primary); display: block; margin-bottom: 4px; }
      .notification-message { font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 4px 0; }
      small { font-size: 0.75rem; }
    }

    .empty-state {
      text-align: center; padding: 64px 24px; color: var(--text-muted);
      mat-icon { font-size: 64px; width: 64px; height: 64px; opacity: 0.3; margin-bottom: 16px; overflow: hidden; }
      p { font-size: 1rem; margin-bottom: 8px; color: var(--text-primary); }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly notificationService = inject(NotificationService);

  loading = signal(true);
  notifications = signal<Notification[]>([]);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  hasUnread(): boolean {
    return this.notifications().some(n => !n.isRead);
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      }
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => ({ ...n, isRead: true }))
        );
      }
    });
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<string, string> = {
      TASK_ASSIGNED: 'person_add',
      TASK_UPDATED: 'edit',
      COMMENT_ADDED: 'comment',
      MEMBER_ADDED: 'group_add',
      PROJECT_UPDATED: 'folder',
      MENTION: 'alternate_email',
      DEADLINE_APPROACHING: 'schedule'
    };
    return icons[type] || 'notifications';
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return this.translate.instant('common.timeAgo.justNow');
    if (minutes < 60) return this.translate.instant('common.timeAgo.minutes', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return this.translate.instant('common.timeAgo.hours', { count: hours });
    const days = Math.floor(hours / 24);
    if (days < 7) return this.translate.instant('common.timeAgo.days', { count: days });
    const localeMap: Record<string, string> = { tr: 'tr-TR', en: 'en-US' };
    const locale = localeMap[this.translate.currentLang] || 'en-US';
    return date.toLocaleDateString(locale);
  }
}
