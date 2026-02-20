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
    CommonModule,
    TranslateModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="project-detail">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>{{ 'projectDetail.loadingProject' | translate }}</p>
        </div>
      } @else if (project()) {
        <!-- Project Header -->
        <div class="project-header cirquetask-card">
          <div class="header-top">
            <div class="project-info">
              <span class="color-dot" [style.background-color]="project()!.color"></span>
              <div>
                <h1>{{ project()!.name }}</h1>
                @if (project()!.description) {
                  <p class="description">{{ project()!.description }}</p>
                }
              </div>
            </div>
            @if (defaultBoardId()) {
              <a
                [routerLink]="['/projects', projectId(), 'board', defaultBoardId()]"
                mat-raised-button
                color="primary"
              >
                <mat-icon>dashboard</mat-icon>
                {{ 'projectDetail.goToBoard' | translate }}
              </a>
            }
          </div>
          <div class="header-meta">
            <span class="meta-item">
              <mat-icon>people</mat-icon>
              {{ project()!.memberCount }} {{ 'projectDetail.members' | translate }}
            </span>
            <span class="meta-item">
              <mat-icon>task_alt</mat-icon>
              {{ project()!.taskCount }} {{ 'projectDetail.tasks' | translate }}
            </span>
            <span class="prefix">{{ project()!.prefix }}</span>
          </div>
        </div>

        <!-- Tabs -->
        <mat-tab-group class="project-tabs" animationDuration="200ms">
          <mat-tab [label]="'projectDetail.tabBoards' | translate">
            <div class="tab-content">
              @if (boards().length === 0) {
                <div class="empty-state cirquetask-card">
                  <mat-icon>dashboard</mat-icon>
                  <p>{{ 'projectDetail.noBoards' | translate }}</p>
                </div>
              } @else {
                <div class="boards-grid">
                  @for (board of boards(); track board.id) {
                    <a
                      [routerLink]="['/projects', projectId(), 'board', board.id]"
                      class="board-card cirquetask-card"
                    >
                      <div class="board-header">
                        <mat-icon>view_kanban</mat-icon>
                        <h3>{{ board.name }}</h3>
                        @if (board.isDefault) {
                          <mat-chip class="default-chip">{{ 'projectDetail.default' | translate }}</mat-chip>
                        }
                      </div>
                      @if (board.description) {
                        <p class="board-desc">{{ board.description }}</p>
                      }
                      <div class="board-meta">
                        {{ board.columns?.length || 0 }} {{ 'projectDetail.columns' | translate }}
                      </div>
                    </a>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab [label]="'projectDetail.tabTasks' | translate">
            <div class="tab-content">
              @if (tasks().length === 0) {
                <div class="empty-state cirquetask-card">
                  <mat-icon>task_alt</mat-icon>
                  <p>{{ 'projectDetail.noTasks' | translate }}</p>
                </div>
              } @else {
                <div class="tasks-list cirquetask-card">
                  @for (task of tasks(); track task.id) {
                    <div class="task-row">
                      <div class="task-priority-dot" [class]="'priority-' + task.priority.toLowerCase()"></div>
                      <div class="task-info">
                        <span class="task-key">{{ task.taskKey }}</span>
                        <span class="task-title">{{ task.title }}</span>
                      </div>
                      <mat-chip [class]="'status-' + task.status.toLowerCase()">
                        {{ 'common.status.' + task.status | translate }}
                      </mat-chip>
                    </div>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab [label]="'projectDetail.tabMembers' | translate">
            <div class="tab-content">
              @if (members().length === 0) {
                <div class="empty-state cirquetask-card">
                  <mat-icon>people</mat-icon>
                  <p>{{ 'projectDetail.noMembers' | translate }}</p>
                </div>
              } @else {
                <div class="members-list cirquetask-card">
                  @for (member of members(); track member.id) {
                    <div class="member-row">
                      <div class="member-avatar">
                        {{ getInitials(member) }}
                      </div>
                      <div class="member-info">
                        <span class="member-name">{{ member.firstName }} {{ member.lastName }}</span>
                        <span class="member-email text-muted">{{ member.email }}</span>
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
        <div class="error-state cirquetask-card">
          <mat-icon>error_outline</mat-icon>
          <h3>{{ 'projectDetail.notFound' | translate }}</h3>
          <p class="text-muted">{{ 'projectDetail.notFoundDesc' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .project-detail { max-width: 1200px; margin: 0 auto; }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      gap: 16px;
      color: var(--text-secondary);
    }

    .project-header {
      margin-bottom: 24px;
    }

    .header-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }

    .project-info {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .color-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .project-info h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }

    .description {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      min-width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .prefix {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary);
      margin-left: auto;
    }

    .project-tabs {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .tab-content {
      padding: 24px;
      min-height: 200px;
    }

    .boards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .board-card {
      display: block;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .board-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .board-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .board-header mat-icon {
      color: var(--primary);
      font-size: 24px;
      width: 24px;
      min-width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .board-header h3 {
      flex: 1;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .default-chip {
      font-size: 0.7rem;
    }

    .board-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0 0 12px 0;
      line-height: 1.4;
    }

    .board-meta {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .tasks-list {
      padding: 0;
    }

    .task-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .task-row:last-child {
      border-bottom: none;
    }

    .task-priority-dot {
      width: 8px;
      min-width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }

    .task-info {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .task-key {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
      white-space: nowrap;
    }

    .task-title {
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .members-list {
      padding: 0;
    }

    .member-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .member-row:last-child {
      border-bottom: none;
    }

    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .member-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .member-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .member-email {
      font-size: 0.8rem;
    }

    .role-chip {
      font-size: 0.75rem;
    }

    .empty-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-state > mat-icon, .error-state > mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--text-muted);
      opacity: 0.5;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .empty-state p, .error-state p {
      margin: 0;
    }

    .error-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }

    .status-open { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .status-in_progress { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .status-in_review { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
    .status-done { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .status-cancelled { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }

    @media (max-width: 768px) {
      .header-top {
        flex-direction: column;
      }

      .header-meta {
        flex-wrap: wrap;
      }

      .prefix {
        margin-left: 0;
        width: 100%;
      }
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
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.projectService.getProject(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.project.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.boardService.getProjectBoards(id).subscribe({
      next: (res) => {
        if (res.success) this.boards.set(res.data);
      }
    });

    this.taskService.getProjectTasks(id).subscribe({
      next: (res) => {
        if (res.success) this.tasks.set(res.data);
      }
    });

    this.projectService.getMembers(id).subscribe({
      next: (res) => {
        if (res.success) this.members.set(res.data);
      }
    });
  }

  getInitials(member: Member): string {
    return `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || '?';
  }
}
