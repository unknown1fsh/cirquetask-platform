import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard, Task, ActivityLog } from '../../core/models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    NgChartsModule
  ],
  template: `
    <div class="analytics">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>{{ 'analytics.loadingAnalytics' | translate }}</p>
        </div>
      } @else {
        <div class="page-header">
          <h1>{{ 'analytics.title' | translate }}</h1>
          <p class="text-muted">{{ 'analytics.subtitle' | translate }}</p>
        </div>

        <!-- Charts Row -->
        <div class="charts-grid">
          <div class="cirquetask-card chart-card">
            <h3>{{ 'analytics.taskDistribution' | translate }}</h3>
            @if (statusChartData()) {
              <canvas baseChart [data]="statusChartData()!" [options]="doughnutOptions" type="doughnut" height="250"></canvas>
            } @else {
              <div class="empty-chart">
                <mat-icon>pie_chart</mat-icon>
                <p>{{ 'analytics.noTaskData' | translate }}</p>
              </div>
            }
          </div>

          <div class="cirquetask-card chart-card">
            <h3>{{ 'analytics.tasksByPriority' | translate }}</h3>
            @if (priorityChartData()) {
              <canvas baseChart [data]="priorityChartData()!" [options]="barOptions" type="bar" height="250"></canvas>
            } @else {
              <div class="empty-chart">
                <mat-icon>bar_chart</mat-icon>
                <p>{{ 'analytics.noPriorityData' | translate }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Completion Rate -->
        <div class="cirquetask-card completion-card">
          <h3>{{ 'analytics.completionRate' | translate }}</h3>
          <div class="progress-section">
            <div class="progress-header">
              <span class="text-muted">{{ 'analytics.tasksCompleted' | translate:{ completed: completedTasks(), total: totalTasks() } }}</span>
              <span class="completion-value">{{ completionRate() }}%</span>
            </div>
            <mat-progress-bar mode="determinate" [value]="completionRate()"></mat-progress-bar>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="bottom-grid">
          <!-- Upcoming Deadlines -->
          <div class="cirquetask-card">
            <div class="card-header">
              <h3>{{ 'analytics.upcomingDeadlines' | translate }}</h3>
              <span class="badge">{{ upcomingDeadlines().length }}</span>
            </div>
            @if (upcomingDeadlines().length) {
              @for (task of upcomingDeadlines(); track task.id) {
                <div class="task-row">
                  <div class="task-priority-dot" [class]="'priority-' + task.priority.toLowerCase()"></div>
                  <div class="task-info">
                    <span class="task-key">{{ task.taskKey }}</span>
                    <span class="task-title truncate">{{ task.title }}</span>
                    <small class="text-muted">{{ formatDate(task.dueDate!) }}</small>
                  </div>
                  <mat-chip [class]="'status-' + task.status.toLowerCase()">{{ 'common.status.' + task.status | translate }}</mat-chip>
                </div>
              }
            } @else {
              <div class="empty-state">
                <mat-icon>event</mat-icon>
                <p>{{ 'analytics.noDeadlines' | translate }}</p>
              </div>
            }
          </div>

          <!-- Recent Activities -->
          <div class="cirquetask-card">
            <h3>{{ 'analytics.recentActivity' | translate }}</h3>
            @if (recentActivities().length) {
              @for (activity of recentActivities(); track activity.id) {
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
                <p>{{ 'analytics.noActivity' | translate }}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .analytics { max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .page-header p { margin-top: 4px; }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 64px; color: var(--text-muted);
      mat-spinner { margin-bottom: 16px; }
    }

    .charts-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;
    }
    .chart-card h3 { margin-bottom: 16px; font-weight: 600; color: var(--text-primary); }
    .empty-chart {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 250px; color: var(--text-muted);
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; overflow: hidden; }
    }

    .completion-card { margin-bottom: 24px; }
    .completion-card h3 { margin-bottom: 16px; font-weight: 600; color: var(--text-primary); }
    .progress-section { padding: 8px 0; }
    .progress-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px; font-size: 0.875rem;
    }
    .completion-value { font-weight: 700; color: var(--primary); }

    .bottom-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    .bottom-grid h3 { font-weight: 600; color: var(--text-primary); }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .badge {
      background: var(--primary); color: white; font-size: 0.75rem;
      padding: 2px 10px; border-radius: 12px; font-weight: 600;
    }

    .task-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid var(--border-color);
      &:last-child { border-bottom: none; }
    }
    .task-priority-dot { width: 8px; min-width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .task-info {
      flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;
      small { font-size: 0.75rem; }
    }
    .task-key { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
    .task-title { font-size: 0.875rem; color: var(--text-primary); }

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
      flex: 1;
      p { font-size: 0.85rem; margin-bottom: 2px; color: var(--text-primary); }
    }

    .empty-state {
      text-align: center; padding: 32px 0; color: var(--text-muted);
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; overflow: hidden; }
    }

    @media (max-width: 1024px) {
      .charts-grid, .bottom-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dashboardService = inject(DashboardService);
  private readonly translate = inject(TranslateService);

  loading = signal(true);
  dashboard = signal<Dashboard | null>(null);
  statusChartData = signal<ChartConfiguration<'doughnut'>['data'] | null>(null);
  priorityChartData = signal<ChartConfiguration<'bar'>['data'] | null>(null);

  projectId = computed(() => {
    const id = this.route.snapshot.paramMap.get('projectId');
    return id ? +id : 0;
  });

  totalTasks = computed(() => this.dashboard()?.totalTasks ?? 0);
  completedTasks = computed(() => this.dashboard()?.completedTasks ?? 0);
  completionRate = computed(() => {
    const total = this.totalTasks();
    const completed = this.completedTasks();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  upcomingDeadlines = computed(() => {
    const deadlines = this.dashboard()?.upcomingDeadlines ?? [];
    return deadlines.slice(0, 8);
  });

  recentActivities = computed(() => {
    const activities = this.dashboard()?.recentActivities ?? [];
    return activities.slice(0, 8);
  });

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  ngOnInit(): void {
    const pid = this.projectId();
    if (pid) {
      this.dashboardService.getProjectDashboard(pid).subscribe({
        next: (res) => {
          if (res.success) {
            this.dashboard.set(res.data);
            this.buildCharts(res.data);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  private buildCharts(data: Dashboard): void {
    const statusColors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e', '#94a3b8'];
    const statusKeys = ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'];
    const statusLabels = statusKeys.map(k => this.translate.instant('common.status.' + k));
    const statusValues: number[] = data.tasksByStatus ? Object.values(data.tasksByStatus) as number[] : [];

    if (statusValues.some((v: number) => v > 0)) {
      this.statusChartData.set({
        labels: statusLabels,
        datasets: [{ data: statusValues, backgroundColor: statusColors, borderWidth: 0 }]
      });
    }

    const priorityColors = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#94a3b8'];
    const priorityKeys = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];
    const priorityLabels = priorityKeys.map(k => this.translate.instant('common.priority.' + k));
    const priorityValues: number[] = data.tasksByPriority ? Object.values(data.tasksByPriority) as number[] : [];

    if (priorityValues.some((v: number) => v > 0)) {
      this.priorityChartData.set({
        labels: priorityLabels,
        datasets: [{ data: priorityValues, backgroundColor: priorityColors, borderRadius: 8, borderWidth: 0 }]
      });
    }
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
      CREATE: 'add_circle', UPDATE: 'edit', DELETE: 'delete', MOVE: 'swap_horiz', ADD_MEMBER: 'person_add'
    };
    return icons[action] || 'info';
  }

  private get locale(): string {
    const map: Record<string, string> = { tr: 'tr-TR', en: 'en-US' };
    return map[this.translate.currentLang] || 'en-US';
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
    return this.translate.instant('common.timeAgo.days', { count: days });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.locale, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}
