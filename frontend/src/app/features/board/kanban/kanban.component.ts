import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BoardService } from '../../../core/services/board.service';
import { TaskService } from '../../../core/services/task.service';
import { Board, Column, Task } from '../../../core/models';
import { TaskDetailComponent } from '../task-detail/task-detail.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule, DragDropModule, RouterLink,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatChipsModule, MatTooltipModule, MatDialogModule, TranslateModule
  ],
  template: `
    <div class="kanban-page">
      <div class="board-header">
        <div>
          <h2>{{ board()?.name || ('kanban.board' | translate) }}</h2>
          <p class="text-muted text-sm">{{ 'kanban.dragDrop' | translate }}</p>
        </div>
        <div class="board-actions">
          <button mat-stroked-button (click)="addColumn()">
            <mat-icon>add</mat-icon> {{ 'kanban.addColumn' | translate }}
          </button>
        </div>
      </div>

      <div class="board-container" cdkDropListGroup>
        @for (column of board()?.columns || []; track column.id) {
          <div class="column" [style.border-top-color]="column.color">
            <div class="column-header">
              <div class="column-title">
                <span class="column-dot" [style.background]="column.color"></span>
                <h3>{{ column.name }}</h3>
                <span class="task-count">{{ column.tasks?.length || 0 }}</span>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="columnMenu" class="col-menu-btn">
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #columnMenu="matMenu">
                <button mat-menu-item (click)="createTask(column.id)">
                  <mat-icon>add</mat-icon> {{ 'kanban.newTask' | translate }}
                </button>
                <button mat-menu-item (click)="removeColumn(column.id)">
                  <mat-icon>delete</mat-icon> {{ 'kanban.deleteColumn' | translate }}
                </button>
              </mat-menu>
            </div>

            <div class="task-list"
                 cdkDropList
                 [cdkDropListData]="column.tasks || []"
                 [id]="'column-' + column.id"
                 [cdkDropListConnectedTo]="getConnectedLists()"
                 (cdkDropListDropped)="onTaskDrop($event, column)">

              @for (task of column.tasks || []; track task.id) {
                <div class="task-card" cdkDrag (click)="openTaskDetail(task)">
                  <div class="task-card-header">
                    <span class="task-type" [class]="'type-' + task.type.toLowerCase()">
                      <mat-icon>{{ getTypeIcon(task.type) }}</mat-icon>
                    </span>
                    <span class="task-key">{{ task.taskKey }}</span>
                  </div>
                  <p class="task-card-title">{{ task.title }}</p>
                  <div class="task-card-footer">
                    <div class="task-labels">
                      @for (label of task.labels || []; track label.id) {
                        <span class="label-dot" [style.background]="label.color" [matTooltip]="label.name"></span>
                      }
                    </div>
                    <div class="task-meta">
                      @if (task.dueDate) {
                        <span class="due-date" [class.overdue]="isOverdue(task.dueDate)">
                          <mat-icon>schedule</mat-icon> {{ formatDate(task.dueDate) }}
                        </span>
                      }
                      @if (task.commentCount > 0) {
                        <span class="meta-item"><mat-icon>chat_bubble_outline</mat-icon> {{ task.commentCount }}</span>
                      }
                    </div>
                  </div>
                  @if (task.assignees?.length) {
                    <div class="task-assignees">
                      @for (assignee of task.assignees.slice(0, 3); track assignee.id) {
                        <div class="mini-avatar" [matTooltip]="assignee.firstName + ' ' + assignee.lastName">
                          {{ assignee.firstName[0] }}{{ assignee.lastName[0] }}
                        </div>
                      }
                      @if (task.assignees.length > 3) {
                        <span class="more-assignees">+{{ task.assignees.length - 3 }}</span>
                      }
                    </div>
                  }
                  <div class="priority-bar" [class]="'priority-bg-' + task.priority.toLowerCase()"></div>
                </div>
              }
            </div>

            <button class="add-task-btn" (click)="createTask(column.id)">
              <mat-icon>add</mat-icon> {{ 'kanban.newTask' | translate }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .kanban-page { height: calc(100vh - var(--header-height) - 48px); display: flex; flex-direction: column; }
    .board-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px; flex-shrink: 0;
      h2 { font-size: 1.25rem; font-weight: 700; }
    }
    .board-container {
      display: flex; gap: 16px; flex: 1;
      overflow-x: auto; padding-bottom: 16px;
    }
    .column {
      min-width: 300px; width: 300px; flex-shrink: 0;
      background: var(--bg-tertiary); border-radius: var(--radius);
      display: flex; flex-direction: column;
      border-top: 3px solid;
      max-height: 100%;
    }
    .column-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px;
    }
    .column-title { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; overflow: hidden; }
    .column-dot { width: 10px; min-width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .column-title h3 { font-size: 0.875rem; font-weight: 600; margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .task-count {
      font-size: 0.7rem; font-weight: 700;
      background: var(--border-color); color: var(--text-secondary);
      padding: 1px 8px; border-radius: 10px;
    }
    .col-menu-btn { width: 28px; height: 28px; line-height: 28px; flex-shrink: 0; }

    .task-list {
      flex: 1; overflow-y: auto;
      padding: 0 8px; min-height: 60px;
    }

    .task-card {
      background: var(--bg-card); border: 1px solid var(--border-color);
      border-radius: var(--radius-sm); padding: 12px;
      margin-bottom: 8px; cursor: grab; position: relative;
      transition: box-shadow 0.2s, transform 0.2s;
      overflow: hidden;
      &:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
      &:active { cursor: grabbing; }
    }
    .task-card-header {
      display: flex; align-items: center; gap: 6px; margin-bottom: 6px; min-width: 0;
    }
    .task-type { flex-shrink: 0; }
    .task-type mat-icon { font-size: 16px; width: 16px; min-width: 16px; height: 16px; flex-shrink: 0; }
    .task-key { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); flex-shrink: 0; }
    .task-card-title { font-size: 0.85rem; font-weight: 500; line-height: 1.4; margin: 0 0 8px 0; min-width: 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word; }

    .task-card-footer {
      display: flex; align-items: center; justify-content: space-between;
    }
    .task-labels { display: flex; gap: 4px; }
    .label-dot { width: 8px; min-width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .task-meta { display: flex; align-items: center; gap: 8px; }
    .meta-item, .due-date {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.7rem; color: var(--text-muted);
      mat-icon { font-size: 14px; width: 14px; min-width: 14px; height: 14px; flex-shrink: 0; }
    }
    .due-date.overdue { color: #ef4444; }

    .task-assignees {
      display: flex; gap: -4px; margin-top: 8px;
    }
    .mini-avatar {
      width: 24px; height: 24px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white; font-size: 0.6rem; font-weight: 700; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--bg-card); margin-left: -4px;
      &:first-child { margin-left: 0; }
    }
    .more-assignees { font-size: 0.7rem; color: var(--text-muted); margin-left: 4px; }

    .priority-bar {
      position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    }
    .priority-bg-critical { background: #dc2626; }
    .priority-bg-high { background: #f97316; }
    .priority-bg-medium { background: #eab308; }
    .priority-bg-low { background: #22c55e; }
    .priority-bg-none { background: transparent; }

    .add-task-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 8px; margin: 8px;
      border: 1px dashed var(--border-color); border-radius: var(--radius-sm);
      background: none; color: var(--text-muted); cursor: pointer;
      font-size: 0.8rem; transition: all 0.2s;
      mat-icon { width: 18px; min-width: 18px; height: 18px; font-size: 18px; flex-shrink: 0; }
      &:hover { border-color: var(--primary); color: var(--primary); background: rgba(99,102,241,0.05); }
    }

    // CDK Drag styles
    .cdk-drag-preview { box-shadow: var(--shadow-lg); border-radius: var(--radius-sm); opacity: 0.9; }
    .cdk-drag-placeholder { opacity: 0.3; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .task-list.cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class KanbanComponent implements OnInit {
  board = signal<Board | null>(null);
  projectId!: number;
  boardId!: number;

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.params['projectId'];
    this.boardId = +this.route.snapshot.params['boardId'];
    this.loadBoard();
  }

  loadBoard(): void {
    this.boardService.getBoard(this.boardId).subscribe({
      next: (res) => {
        if (res.success) {
          this.board.set(res.data);
        }
      }
    });
  }

  getConnectedLists(): string[] {
    return (this.board()?.columns || []).map(c => 'column-' + c.id);
  }

  onTaskDrop(event: CdkDragDrop<Task[]>, targetColumn: Column): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }

    const task = event.container.data[event.currentIndex];
    if (task) {
      this.taskService.moveTask(task.id, {
        columnId: targetColumn.id,
        position: event.currentIndex
      }).subscribe({
        error: () => this.loadBoard()
      });
    }
  }

  createTask(columnId: number): void {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '600px',
      data: { projectId: this.projectId, columnId, mode: 'create' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadBoard();
    });
  }

  openTaskDetail(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '700px',
      data: { task, projectId: this.projectId, mode: 'edit' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadBoard();
    });
  }

  addColumn(): void {
    const name = prompt(this.translate.instant('kanban.columnNamePrompt'));
    if (name) {
      this.boardService.addColumn(this.boardId, name).subscribe({
        next: () => this.loadBoard(),
        error: () => this.snackBar.open(this.translate.instant('kanban.failedAddColumn'), this.translate.instant('common.close'), { duration: 3000 })
      });
    }
  }

  removeColumn(columnId: number): void {
    if (confirm(this.translate.instant('kanban.deleteColumnConfirm'))) {
      this.boardService.removeColumn(columnId).subscribe({
        next: () => this.loadBoard(),
        error: (err) => this.snackBar.open(err.error?.message || this.translate.instant('common.failed'), this.translate.instant('common.close'), { duration: 3000 })
      });
    }
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      TASK: 'check_box', BUG: 'bug_report', FEATURE: 'star',
      IMPROVEMENT: 'trending_up', EPIC: 'flash_on'
    };
    return icons[type] || 'task';
  }

  isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  private get locale(): string {
    const map: Record<string, string> = { tr: 'tr-TR', en: 'en-US' };
    return map[this.translate.currentLang] || 'en-US';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.locale, { month: 'short', day: 'numeric' });
  }
}
