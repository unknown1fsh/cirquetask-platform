import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectService } from '../../../core/services/project.service';
import { BoardService } from '../../../core/services/board.service';
import { TaskService } from '../../../core/services/task.service';
import { Project, Board, Task, Member } from '../../../core/models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatChipsModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="project-detail">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>{{ 'projectDetail.loadingProject' | translate }}</p>
        </div>
      } @else if (project()) {
        <div class="detail-header">
          <div class="header-info">
            <div class="header-row">
              <span class="color-dot" [style.background]="project()!.color"></span>
              <h1>{{ project()!.name }}</h1>
              <span class="prefix-tag">{{ project()!.prefix }}</span>
            </div>
            @if (project()!.description) {
              <p class="header-desc">{{ project()!.description }}</p>
            }
            <div class="header-meta">
              <span class="meta"><mat-icon>people_outline</mat-icon>{{ project()!.memberCount }} {{ 'projectDetail.members' | translate }}</span>
              <span class="meta"><mat-icon>task_alt</mat-icon>{{ project()!.taskCount }} {{ 'projectDetail.tasks' | translate }}</span>
            </div>
          </div>
          @if (defaultBoardId()) {
            <a [routerLink]="['/projects', projectId(), 'board', defaultBoardId()]" mat-flat-button color="primary">
              <mat-icon>view_kanban</mat-icon>
              {{ 'projectDetail.goToBoard' | translate }}
            </a>
          }
        </div>

        <mat-tab-group class="detail-tabs" animationDuration="200ms">
          <mat-tab [label]="'projectDetail.tabBoards' | translate">
            <div class="tab-body">
              @if (boards().length === 0) {
                <div class="tab-empty"><mat-icon>view_kanban</mat-icon><p>{{ 'projectDetail.noBoards' | translate }}</p></div>
              } @else {
                <div class="boards-grid">
                  @for (board of boards(); track board.id) {
                    <a [routerLink]="['/projects', projectId(), 'board', board.id]" class="board-item">
                      <div class="board-top">
                        <mat-icon>view_kanban</mat-icon>
                        <h3>{{ board.name }}</h3>
                        @if (board.isDefault) {
                          <mat-chip class="default-chip">{{ 'projectDetail.default' | translate }}</mat-chip>
                        }
                      </div>
                      @if (board.description) { <p class="board-desc">{{ board.description }}</p> }
                      <span class="board-meta">{{ board.columns?.length || 0 }} {{ 'projectDetail.columns' | translate }}</span>
                    </a>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab [label]="'projectDetail.tabTasks' | translate">
            <div class="tab-body">
              @if (tasks().length === 0) {
                <div class="tab-empty"><mat-icon>task_alt</mat-icon><p>{{ 'projectDetail.noTasks' | translate }}</p></div>
              } @else {
                <div class="task-table">
                  @for (task of tasks(); track task.id) {
                    <div class="task-row">
                      <span class="priority-dot" [class]="'priority-' + task.priority.toLowerCase()"></span>
                      <span class="task-key">{{ task.taskKey }}</span>
                      <span class="task-title">{{ task.title }}</span>
                      <mat-chip [class]="'status-' + task.status.toLowerCase()">{{ 'common.status.' + task.status | translate }}</mat-chip>
                    </div>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab [label]="'projectDetail.tabMembers' | translate">
            <div class="tab-body">
              @if (members().length === 0) {
                <div class="tab-empty"><mat-icon>people_outline</mat-icon><p>{{ 'projectDetail.noMembers' | translate }}</p></div>
              } @else {
                <div class="members-table">
                  @for (member of members(); track member.id) {
                    <div class="member-row">
                      <div class="member-avatar">{{ getInitials(member) }}</div>
                      <div class="member-info">
                        <span class="member-name">{{ member.firstName }} {{ member.lastName }}</span>
                        <span class="member-email">{{ member.email }}</span>
                      </div>
                      <mat-chip class="role-chip">{{ member.role }}</mat-chip>
                    </div>
                  }
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      } @else {
        <div class="error-state">
          <div class="error-icon"><mat-icon>error_outline</mat-icon></div>
          <h3>{{ 'projectDetail.notFound' | translate }}</h3>
          <p>{{ 'projectDetail.notFoundDesc' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .project-detail { max-width: 1100px; margin: 0 auto; }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-16); gap: var(--space-4); color: var(--text-secondary);
    }

    .detail-header {
      display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-6);
      background: var(--bg-card); border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg); padding: var(--space-6);
      margin-bottom: var(--space-6); flex-wrap: wrap;
    }

    .header-row {
      display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);
    }
    .color-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .header-row h1 { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; }
    .prefix-tag {
      font-size: 0.6875rem; font-weight: 700; color: var(--primary);
      background: var(--primary-surface); padding: 2px 8px; border-radius: var(--radius-xs); font-family: monospace;
    }

    .header-desc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-4); }
    .header-meta { display: flex; gap: var(--space-5); }
    .meta {
      display: flex; align-items: center; gap: var(--space-1);
      font-size: 0.8125rem; color: var(--text-tertiary);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .detail-tabs {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .tab-body { padding: var(--space-6); min-height: 200px; }

    .tab-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-12) 0; color: var(--text-muted);
      mat-icon { font-size: 36px; width: 36px; height: 36px; opacity: 0.2; margin-bottom: var(--space-2); }
      p { font-size: 0.875rem; }
    }

    .boards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-4); }
    .board-item {
      display: block; text-decoration: none; color: inherit;
      border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: var(--space-5);
      transition: box-shadow var(--transition-base), transform var(--transition-base);
      &:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
    }
    .board-top {
      display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);
      mat-icon { color: var(--primary); font-size: 20px; width: 20px; height: 20px; }
      h3 { flex: 1; font-size: 0.9375rem; font-weight: 600; }
    }
    .default-chip { font-size: 0.625rem !important; }
    .board-desc { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: var(--space-3); }
    .board-meta { font-size: 0.75rem; color: var(--text-muted); }

    .task-table, .members-table { display: flex; flex-direction: column; }
    .task-row {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--border-secondary);
      &:last-child { border-bottom: none; }
    }
    .priority-dot { width: 7px; min-width: 7px; height: 7px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .task-key { font-size: 0.6875rem; color: var(--text-muted); font-weight: 600; font-family: monospace; flex-shrink: 0; }
    .task-title { flex: 1; min-width: 0; font-size: 0.8125rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .member-row {
      display: flex; align-items: center; gap: var(--space-4);
      padding: var(--space-4); border-bottom: 1px solid var(--border-secondary);
      &:last-child { border-bottom: none; }
    }
    .member-avatar {
      width: 36px; height: 36px; border-radius: var(--radius-full);
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.75rem; flex-shrink: 0;
    }
    .member-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
    .member-name { font-weight: 500; font-size: 0.875rem; color: var(--text-primary); }
    .member-email { font-size: 0.75rem; color: var(--text-muted); }

    .error-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-16); text-align: center;
      background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-lg);
    }
    .error-icon {
      width: 64px; height: 64px; border-radius: var(--radius-xl); background: var(--danger-surface);
      display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-5);
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: var(--danger); }
    }
    .error-state h3 { font-size: 1.0625rem; font-weight: 600; margin-bottom: var(--space-2); }
    .error-state p { color: var(--text-secondary); }

    .status-open { background: rgba(59,130,246,0.12) !important; color: #3b82f6 !important; }
    .status-in_progress { background: rgba(245,158,11,0.12) !important; color: #d97706 !important; }
    .status-in_review { background: rgba(139,92,246,0.12) !important; color: #8b5cf6 !important; }
    .status-done { background: rgba(16,185,129,0.12) !important; color: #10b981 !important; }
    .status-cancelled { background: rgba(148,163,184,0.12) !important; color: #94a3b8 !important; }

    @media (max-width: 768px) {
      .detail-header { flex-direction: column; }
      .header-meta { flex-wrap: wrap; }
    }
  `]
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private boardService = inject(BoardService);
  private taskService = inject(TaskService);

  project = signal<Project | null>(null);
  boards = signal<Board[]>([]);
  tasks = signal<Task[]>([]);
  members = signal<Member[]>([]);
  loading = signal(true);

  projectId = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  defaultBoardId = computed(() => {
    const boardsList = this.boards();
    const defaultBoard = boardsList.find(b => b.isDefault);
    return defaultBoard?.id ?? boardsList[0]?.id ?? 0;
  });

  ngOnInit(): void {
    const id = this.projectId();
    if (!id) { this.loading.set(false); return; }

    this.projectService.getProject(id).subscribe({
      next: (res) => { if (res.success) this.project.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.boardService.getProjectBoards(id).subscribe({
      next: (res) => { if (res.success) this.boards.set(res.data); }
    });
    this.taskService.getProjectTasks(id).subscribe({
      next: (res) => { if (res.success) this.tasks.set(res.data); }
    });
    this.projectService.getMembers(id).subscribe({
      next: (res) => { if (res.success) this.members.set(res.data); }
    });
  }

  getInitials(member: Member): string {
    return `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || '?';
  }
}
