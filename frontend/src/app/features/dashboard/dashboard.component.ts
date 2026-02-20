import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/auth/auth.service';
import { Dashboard, Task, ActivityLog } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatIconModule,
    MatButtonModule, MatProgressBarModule, MatChipsModule, NgChartsModule, TranslateModule
  ],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1>{{ 'dashboard.welcome' | translate:{ name: authService.currentUser()?.firstName } }}</h1>
          <p class="header-subtitle">{{ 'dashboard.subtitle' | translate }}</p>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon projects"><mat-icon>folder_open</mat-icon></div>
          <div class="stat-body">
            <span class="stat-value">{{ dashboard()?.totalProjects || 0 }}</span>
            <span class="stat-label">{{ 'dashboard.projects' | translate }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon tasks"><mat-icon>task_alt</mat-icon></div>
          <div class="stat-body">
            <span class="stat-value">{{ dashboard()?.totalTasks || 0 }}</span>
            <span class="stat-label">{{ 'dashboard.totalTasks' | translate }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed"><mat-icon>check_circle_outline</mat-icon></div>
          <div class="stat-body">
            <span class="stat-value">{{ dashboard()?.completedTasks || 0 }}</span>
            <span class="stat-label">{{ 'dashboard.completed' | translate }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon overdue"><mat-icon>schedule</mat-icon></div>
          <div class="stat-body">
            <span class="stat-value">{{ dashboard()?.overdueTasks || 0 }}</span>
            <span class="stat-label">{{ 'dashboard.overdue' | translate }}</span>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="card">
          <div class="card-title">{{ 'dashboard.tasksByStatus' | translate }}</div>
          @if (statusChartData) {
            <div class="chart-wrap">
              <canvas baseChart [data]="statusChartData" [options]="doughnutOptions" type="doughnut" height="240"></canvas>
            </div>
          } @else {
            <div class="empty-chart">
              <mat-icon>pie_chart_outline</mat-icon>
              <span>{{ 'dashboard.noTasks' | translate }}</span>
            </div>
          }
        </div>
        <div class="card">
          <div class="card-title">{{ 'dashboard.tasksByPriority' | translate }}</div>
          @if (priorityChartData) {
            <div class="chart-wrap">
              <canvas baseChart [data]="priorityChartData" [options]="barOptions" type="bar" height="240"></canvas>
            </div>
          } @else {
            <div class="empty-chart">
              <mat-icon>bar_chart</mat-icon>
              <span>{{ 'dashboard.noTasks' | translate }}</span>
            </div>
          }
        </div>
      </div>

      <div class="bottom-row">
        <div class="card">
          <div class="card-header">
            <div class="card-title">{{ 'dashboard.myTasks' | translate }}</div>
            <span class="count-pill">{{ dashboard()?.myTasks?.length || 0 }}</span>
          </div>
          @if (dashboard()?.myTasks?.length) {
            <div class="task-list">
              @for (task of dashboard()!.myTasks!; track task.id) {
                <div class="task-item">
                  <span class="priority-dot" [class]="'priority-' + task.priority.toLowerCase()"></span>
                  <span class="task-key">{{ task.taskKey }}</span>
                  <span class="task-title">{{ task.title }}</span>
                  <mat-chip [class]="'status-' + task.status.toLowerCase()">{{ 'common.status.' + task.status | translate }}</mat-chip>
                </div>
              }
            </div>
          } @else {
            <div class="empty-inline">
              <mat-icon>inbox</mat-icon>
              <span>{{ 'dashboard.noTasks' | translate }}</span>
            </div>
          }
        </div>

        <div class="card">
          <div class="card-title">{{ 'dashboard.recentActivity' | translate }}</div>
          @if (dashboard()?.recentActivities?.length) {
            <div class="activity-list">
              @for (activity of dashboard()!.recentActivities!.slice(0, 8); track activity.id) {
                <div class="activity-item">
                  <div class="activity-dot">
                    <mat-icon>{{ getActivityIcon(activity.action) }}</mat-icon>
                  </div>
                  <div class="activity-body">
                    <span class="activity-text">{{ activity.description }}</span>
                    <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-inline">
              <mat-icon>history</mat-icon>
              <span>{{ 'dashboard.noActivity' | translate }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: var(--content-max-width); margin: 0 auto; }

    .page-header {
      margin-bottom: var(--space-6);
      h1 { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; }
      .header-subtitle { color: var(--text-tertiary); font-size: 0.875rem; margin-top: var(--space-1); }
    }

    .stats-row {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      display: flex; align-items: center; gap: var(--space-4);
      transition: box-shadow var(--transition-base);
      &:hover { box-shadow: var(--shadow-sm); }
    }

    .stat-icon {
      width: 44px; min-width: 44px; height: 44px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
      &.projects { background: var(--primary-surface); mat-icon { color: var(--primary); } }
      &.tasks { background: var(--info-surface); mat-icon { color: var(--info); } }
      &.completed { background: var(--success-surface); mat-icon { color: var(--success); } }
      &.overdue { background: var(--danger-surface); mat-icon { color: var(--danger); } }
    }

    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.375rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
    .stat-label { font-size: 0.75rem; color: var(--text-tertiary); font-weight: 500; margin-top: 2px; }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
    }

    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--space-4);
    }

    .card-title {
      font-size: 0.875rem; font-weight: 600; color: var(--text-primary);
      margin-bottom: var(--space-4);
    }
    .card-header .card-title { margin-bottom: 0; }

    .count-pill {
      background: var(--primary);
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: var(--radius-full);
    }

    .charts-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .chart-wrap { display: flex; align-items: center; justify-content: center; }

    .empty-chart {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 200px; color: var(--text-muted);
      mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.25; margin-bottom: var(--space-2); }
      span { font-size: 0.8125rem; }
    }

    .bottom-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);
    }

    .task-list, .activity-list { display: flex; flex-direction: column; }

    .task-item {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--border-secondary);
      min-width: 0;
      &:last-child { border-bottom: none; }
    }
    .priority-dot { width: 7px; min-width: 7px; height: 7px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .task-key { font-size: 0.6875rem; color: var(--text-muted); font-weight: 600; flex-shrink: 0; font-family: monospace; }
    .task-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8125rem; }

    .activity-item {
      display: flex; gap: var(--space-3); padding: var(--space-3) 0;
      border-bottom: 1px solid var(--border-secondary);
      &:last-child { border-bottom: none; }
    }
    .activity-dot {
      width: 30px; min-width: 30px; height: 30px; border-radius: var(--radius);
      background: var(--bg-tertiary);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--text-tertiary); }
    }
    .activity-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .activity-text { font-size: 0.8125rem; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .activity-time { font-size: 0.6875rem; color: var(--text-muted); }

    .empty-inline {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-10) 0; color: var(--text-muted);
      mat-icon { font-size: 36px; width: 36px; height: 36px; opacity: 0.2; margin-bottom: var(--space-2); }
      span { font-size: 0.8125rem; }
    }

    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .charts-row, .bottom-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .stats-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboard = signal<Dashboard | null>(null);
  statusChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  priorityChartData: ChartConfiguration<'bar'>['data'] | null = null;

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } } },
    cutout: '65%'
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.04)' } },
      x: { grid: { display: false } }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getUserDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboard.set(res.data);
          this.buildCharts(res.data);
        }
      }
    });
  }

  buildCharts(data: Dashboard): void {
    const statusColors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#94a3b8'];
    const statusLabels = [
      this.translate.instant('common.status.OPEN'),
      this.translate.instant('common.status.IN_PROGRESS'),
      this.translate.instant('common.status.IN_REVIEW'),
      this.translate.instant('common.status.DONE'),
      this.translate.instant('common.status.CANCELLED')
    ];
    const statusValues = data.tasksByStatus ? Object.values(data.tasksByStatus) : [];

    if (statusValues.some(v => (v as number) > 0)) {
      this.statusChartData = {
        labels: statusLabels,
        datasets: [{ data: statusValues, backgroundColor: statusColors, borderWidth: 0, hoverOffset: 4 }]
      };
    }

    const priorityColors = ['#dc2626', '#f97316', '#eab308', '#10b981', '#94a3b8'];
    const priorityLabels = [
      this.translate.instant('common.priority.CRITICAL'),
      this.translate.instant('common.priority.HIGH'),
      this.translate.instant('common.priority.MEDIUM'),
      this.translate.instant('common.priority.LOW'),
      this.translate.instant('common.priority.NONE')
    ];
    const priorityValues = data.tasksByPriority ? Object.values(data.tasksByPriority) : [];

    if (priorityValues.some(v => (v as number) > 0)) {
      this.priorityChartData = {
        labels: priorityLabels,
        datasets: [{ data: priorityValues, backgroundColor: priorityColors, borderRadius: 6, borderWidth: 0 }]
      };
    }
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
      CREATE: 'add_circle_outline', UPDATE: 'edit', DELETE: 'delete_outline', MOVE: 'swap_horiz', ADD_MEMBER: 'person_add'
    };
    return icons[action] || 'info_outline';
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
    return this.translate.instant('common.timeAgo.days', { count: Math.floor(hours / 24) });
  }
}
