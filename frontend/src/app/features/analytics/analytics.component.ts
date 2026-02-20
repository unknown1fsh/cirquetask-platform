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
    CommonModule, TranslateModule, MatCardModule, MatIconModule,
    MatButtonModule, MatProgressBarModule, MatChipsModule,
    MatProgressSpinnerModule, NgChartsModule
  ],
  template: `
    <div class="analytics">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>{{ 'analytics.loadingAnalytics' | translate }}</p>
        </div>
      } @else {
        <div class="page-header">
          <h1>{{ 'analytics.title' | translate }}</h1>
          <p class="header-subtitle">{{ 'analytics.subtitle' | translate }}</p>
        </div>

        <div class="charts-row">
          <div class="card">
            <div class="card-title">{{ 'analytics.taskDistribution' | translate }}</div>
            @if (statusChartData()) {
              <div class="chart-wrap"><canvas baseChart [data]="statusChartData()!" [options]="doughnutOptions" type="doughnut" height="240"></canvas></div>
            } @else {
              <div class="empty-chart"><mat-icon>pie_chart_outline</mat-icon><span>{{ 'analytics.noTaskData' | translate }}</span></div>
            }
          </div>
          <div class="card">
            <div class="card-title">{{ 'analytics.tasksByPriority' | translate }}</div>
            @if (priorityChartData()) {
              <div class="chart-wrap"><canvas baseChart [data]="priorityChartData()!" [options]="barOptions" type="bar" height="240"></canvas></div>
            } @else {
              <div class="empty-chart"><mat-icon>bar_chart</mat-icon><span>{{ 'analytics.noPriorityData' | translate }}</span></div>
            }
          </div>
        </div>

        <div class="card completion-card">
          <div class="card-title">{{ 'analytics.completionRate' | translate }}</div>
          <div class="progress-row">
            <span class="progress-label">{{ 'analytics.tasksCompleted' | translate:{ completed: completedTasks(), total: totalTasks() } }}</span>
            <span class="progress-value">{{ completionRate() }}%</span>
          </div>
          <mat-progress-bar mode="determinate" [value]="completionRate()"></mat-progress-bar>
        </div>

        <div class="bottom-row">
          <div class="card">
            <div class="card-header">
              <div class="card-title">{{ 'analytics.upcomingDeadlines' | translate }}</div>
              <span class="count-pill">{{ upcomingDeadlines().length }}</span>
            </div>
            @if (upcomingDeadlines().length) {
              @for (task of upcomingDeadlines(); track task.id) {
                <div class="task-item">
                  <span class="priority-dot" [class]="'priority-' + task.priority.toLowerCase()"></span>
                  <div class="task-body">
                    <span class="task-key">{{ task.taskKey }}</span>
                    <span class="task-title">{{ task.title }}</span>
                    <small>{{ formatDate(task.dueDate!) }}</small>
                  </div>
                  <mat-chip [class]="'status-' + task.status.toLowerCase()">{{ 'common.status.' + task.status | translate }}</mat-chip>
                </div>
              }
            } @else {
              <div class="empty-inline"><mat-icon>event</mat-icon><span>{{ 'analytics.noDeadlines' | translate }}</span></div>
            }
          </div>

          <div class="card">
            <div class="card-title">{{ 'analytics.recentActivity' | translate }}</div>
            @if (recentActivities().length) {
              @for (activity of recentActivities(); track activity.id) {
                <div class="activity-item">
                  <div class="activity-dot"><mat-icon>{{ getActivityIcon(activity.action) }}</mat-icon></div>
                  <div class="activity-body">
                    <span class="activity-text">{{ activity.description }}</span>
                    <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
                  </div>
                </div>
              }
            } @else {
              <div class="empty-inline"><mat-icon>history</mat-icon><span>{{ 'analytics.noActivity' | translate }}</span></div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .analytics { max-width: var(--content-max-width); margin: 0 auto; }

    .page-header { margin-bottom: var(--space-6); }
    .page-header h1 { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; }
    .header-subtitle { color: var(--text-tertiary); font-size: 0.875rem; margin-top: var(--space-1); }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-16); color: var(--text-muted); gap: var(--space-4);
    }

    .card {
      background: var(--bg-card); border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg); padding: var(--space-6);
    }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
    .card-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-4); }
    .card-header .card-title { margin-bottom: 0; }
    .count-pill { background: var(--primary); color: white; font-size: 0.6875rem; font-weight: 700; padding: 2px 10px; border-radius: var(--radius-full); }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); }
    .chart-wrap { display: flex; align-items: center; justify-content: center; }
    .empty-chart {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 200px; color: var(--text-muted);
      mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.25; margin-bottom: var(--space-2); }
      span { font-size: 0.8125rem; }
    }

    .completion-card { margin-bottom: var(--space-4); }
    .progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
    .progress-label { font-size: 0.8125rem; color: var(--text-tertiary); }
    .progress-value { font-weight: 700; color: var(--primary); }

    .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

    .task-item {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-3) 0; border-bottom: 1px solid var(--border-secondary);
      &:last-child { border-bottom: none; }
    }
    .priority-dot { width: 7px; min-width: 7px; height: 7px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .task-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .task-key { font-size: 0.6875rem; color: var(--text-muted); font-weight: 600; font-family: monospace; }
    .task-title { font-size: 0.8125rem; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .task-body small { font-size: 0.6875rem; color: var(--text-muted); }

    .activity-item {
      display: flex; gap: var(--space-3); padding: var(--space-3) 0;
      border-bottom: 1px solid var(--border-secondary);
      &:last-child { border-bottom: none; }
    }
    .activity-dot {
      width: 30px; min-width: 30px; height: 30px; border-radius: var(--radius);
      background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;
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

    @media (max-width: 1024px) { .charts-row, .bottom-row { grid-template-columns: 1fr; } }
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

  projectId = computed(() => { const id = this.route.snapshot.paramMap.get('projectId'); return id ? +id : 0; });
  totalTasks = computed(() => this.dashboard()?.totalTasks ?? 0);
  completedTasks = computed(() => this.dashboard()?.completedTasks ?? 0);
  completionRate = computed(() => { const t = this.totalTasks(); return t > 0 ? Math.round((this.completedTasks() / t) * 100) : 0; });
  upcomingDeadlines = computed(() => (this.dashboard()?.upcomingDeadlines ?? []).slice(0, 8));
  recentActivities = computed(() => (this.dashboard()?.recentActivities ?? []).slice(0, 8));

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } } },
    cutout: '65%'
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } }
  };

  ngOnInit(): void {
    const pid = this.projectId();
    if (pid) {
      this.dashboardService.getProjectDashboard(pid).subscribe({
        next: (res) => { if (res.success) { this.dashboard.set(res.data); this.buildCharts(res.data); } this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else { this.loading.set(false); }
  }

  private buildCharts(data: Dashboard): void {
    const statusColors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#94a3b8'];
    const statusKeys = ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'];
    const statusLabels = statusKeys.map(k => this.translate.instant('common.status.' + k));
    const statusValues: number[] = data.tasksByStatus ? Object.values(data.tasksByStatus) as number[] : [];
    if (statusValues.some((v: number) => v > 0)) {
      this.statusChartData.set({ labels: statusLabels, datasets: [{ data: statusValues, backgroundColor: statusColors, borderWidth: 0, hoverOffset: 4 }] });
    }
    const priorityColors = ['#dc2626', '#f97316', '#eab308', '#10b981', '#94a3b8'];
    const priorityKeys = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];
    const priorityLabels = priorityKeys.map(k => this.translate.instant('common.priority.' + k));
    const priorityValues: number[] = data.tasksByPriority ? Object.values(data.tasksByPriority) as number[] : [];
    if (priorityValues.some((v: number) => v > 0)) {
      this.priorityChartData.set({ labels: priorityLabels, datasets: [{ data: priorityValues, backgroundColor: priorityColors, borderRadius: 6, borderWidth: 0 }] });
    }
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = { CREATE: 'add_circle_outline', UPDATE: 'edit', DELETE: 'delete_outline', MOVE: 'swap_horiz', ADD_MEMBER: 'person_add' };
    return icons[action] || 'info_outline';
  }

  private get locale(): string { const map: Record<string, string> = { tr: 'tr-TR', en: 'en-US' }; return map[this.translate.currentLang] || 'en-US'; }

  formatTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return this.translate.instant('common.timeAgo.justNow');
    if (min < 60) return this.translate.instant('common.timeAgo.minutes', { count: min });
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return this.translate.instant('common.timeAgo.hours', { count: hrs });
    return this.translate.instant('common.timeAgo.days', { count: Math.floor(hrs / 24) });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.locale, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
