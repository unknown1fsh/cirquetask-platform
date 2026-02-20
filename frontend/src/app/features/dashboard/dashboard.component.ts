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
          <p class="text-muted">{{ 'dashboard.subtitle' | translate }}</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(99,102,241,0.1); color: #6366f1;">
            <mat-icon>folder</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ dashboard()?.totalProjects || 0 }}</span>
            <span class="stat-label">{{ 'dashboard.projects' | translate }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6;">
            <mat-icon>task_alt</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ dashboard()?.totalTasks || 0 }}</span>
            <span class="stat-label">{{ 'dashboard.totalTasks' | translate }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(34,197,94,0.1); color: #22c55e;">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ dashboard()?.completedTasks || 0 }}</span>
            <span class="stat-label">{{ 'dashboard.completed' | translate }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(239,68,68,0.1); color: #ef4444;">
            <mat-icon>warning</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ dashboard()?.overdueTasks || 0 }}</span>
            <span class="stat-label">{{ 'dashboard.overdue' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">
        <div class="cirquetask-card">
          <h3>{{ 'dashboard.tasksByStatus' | translate }}</h3>
          @if (statusChartData) {
            <canvas baseChart [data]="statusChartData" [options]="doughnutOptions" type="doughnut" height="250"></canvas>
          }
        </div>
        <div class="cirquetask-card">
          <h3>{{ 'dashboard.tasksByPriority' | translate }}</h3>
          @if (priorityChartData) {
            <canvas baseChart [data]="priorityChartData" [options]="barOptions" type="bar" height="250"></canvas>
          }
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="bottom-grid">
        <!-- My Tasks -->
        <div class="cirquetask-card">
          <div class="card-header">
            <h3>{{ 'dashboard.myTasks' | translate }}</h3>
            <span class="badge">{{ dashboard()?.myTasks?.length || 0 }}</span>
          </div>
          @if (dashboard()?.myTasks?.length) {
            @for (task of dashboard()!.myTasks!; track task.id) {
              <div class="task-row">
                <div class="task-priority-dot" [class]="'priority-' + task.priority.toLowerCase()"></div>
                <div class="task-info">
                  <span class="task-key">{{ task.taskKey }}</span>
                  <span class="task-title truncate">{{ task.title }}</span>
                </div>
                <mat-chip [class]="'status-' + task.status.toLowerCase()">{{ 'common.status.' + task.status | translate }}</mat-chip>
              </div>
            }
          } @else {
            <div class="empty-state">
              <mat-icon>inbox</mat-icon>
              <p>{{ 'dashboard.noTasks' | translate }}</p>
            </div>
          }
        </div>

        <!-- Recent Activity -->
        <div class="cirquetask-card">
          <h3>{{ 'dashboard.recentActivity' | translate }}</h3>
          @if (dashboard()?.recentActivities?.length) {
            @for (activity of dashboard()!.recentActivities!.slice(0, 8); track activity.id) {
              <div class="activity-row">
                <div class="activity-icon">
                  <mat-icon>{{ getActivityIcon(activity.action) }}</mat-icon>
                </div>
                <div class="activity-info">
                  <p>{{ activity.description }}</p>
                  <small class="text-muted">{{ formatTime(activity.createdAt) }}</small>
                </div>
              </div>
            }
          } @else {
            <div class="empty-state">
              <mat-icon>history</mat-icon>
              <p>{{ 'dashboard.noActivity' | translate }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; h1 { font-size: 1.5rem; font-weight: 700; } }

    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
    }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--border-color);
      border-radius: var(--radius); padding: 20px;
      display: flex; align-items: center; gap: 16px;
      box-shadow: var(--shadow-sm);
    }
    .stat-icon {
      width: 48px; min-width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
      mat-icon { width: 24px; min-width: 24px; height: 24px; flex-shrink: 0; }
    }
    .stat-value { font-size: 1.5rem; font-weight: 800; display: block; }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }

    .charts-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;
      h3 { margin-bottom: 16px; font-weight: 600; }
    }

    .bottom-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      h3 { font-weight: 600; }
    }

    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .badge {
      background: var(--primary); color: white; font-size: 0.75rem;
      padding: 2px 10px; border-radius: 12px; font-weight: 600;
    }

    .task-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid var(--border-color);
      min-width: 0;
      &:last-child { border-bottom: none; }
    }
    .task-priority-dot { width: 8px; min-width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .task-info { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; overflow: hidden; }
    .task-key { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; white-space: nowrap; flex-shrink: 0; }
    .task-title { font-size: 0.875rem; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .activity-row {
      display: flex; gap: 12px; padding: 10px 0;
      border-bottom: 1px solid var(--border-color);
      &:last-child { border-bottom: none; }
    }
    .activity-icon {
      width: 32px; min-width: 32px; height: 32px; border-radius: 8px;
      background: var(--bg-tertiary);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; min-width: 18px; height: 18px; color: var(--text-secondary); }
    }
    .activity-info {
      flex: 1; min-width: 0; overflow: hidden;
      p { font-size: 0.85rem; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }

    .empty-state {
      text-align: center; padding: 32px 0; color: var(--text-muted);
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; overflow: hidden; }
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-grid, .bottom-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboard = signal<Dashboard | null>(null);
  statusChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  priorityChartData: ChartConfiguration<'bar'>['data'] | null = null;

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
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
    const statusColors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e', '#94a3b8'];
    const statusLabels = [
      this.translate.instant('common.status.OPEN'),
      this.translate.instant('common.status.IN_PROGRESS'),
      this.translate.instant('common.status.IN_REVIEW'),
      this.translate.instant('common.status.DONE'),
      this.translate.instant('common.status.CANCELLED')
    ];
    const statusValues = data.tasksByStatus ? Object.values(data.tasksByStatus) : [];

    this.statusChartData = {
      labels: statusLabels,
      datasets: [{ data: statusValues, backgroundColor: statusColors, borderWidth: 0 }]
    };

    const priorityColors = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#94a3b8'];
    const priorityLabels = [
      this.translate.instant('common.priority.CRITICAL'),
      this.translate.instant('common.priority.HIGH'),
      this.translate.instant('common.priority.MEDIUM'),
      this.translate.instant('common.priority.LOW'),
      this.translate.instant('common.priority.NONE')
    ];
    const priorityValues = data.tasksByPriority ? Object.values(data.tasksByPriority) : [];

    this.priorityChartData = {
      labels: priorityLabels,
      datasets: [{ data: priorityValues, backgroundColor: priorityColors, borderRadius: 8, borderWidth: 0 }]
    };
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
      CREATE: 'add_circle', UPDATE: 'edit', DELETE: 'delete', MOVE: 'swap_horiz', ADD_MEMBER: 'person_add'
    };
    return icons[action] || 'info';
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
