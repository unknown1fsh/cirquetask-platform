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
    <div class="kanban">
      <div class="kanban-header">
        <div>
          <h2>{{ board()?.name || ('kanban.board' | translate) }}</h2>
          <p class="kanban-hint">{{ 'kanban.dragDrop' | translate }}</p>
        </div>
        <button mat-stroked-button (click)="addColumn()">
          <mat-icon>add</mat-icon> {{ 'kanban.addColumn' | translate }}
        </button>
      </div>

      <div class="board" cdkDropListGroup>
        @for (column of board()?.columns || []; track column.id) {
          <div class="column">
            <div class="column-head">
              <span class="col-dot" [style.background]="column.color"></span>
              <h3>{{ column.name }}</h3>
              <span class="col-count">{{ column.tasks?.length || 0 }}</span>
              <span class="col-spacer"></span>
              <button class="col-menu-trigger" [matMenuTriggerFor]="columnMenu">
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #columnMenu="matMenu">
                <button mat-menu-item (click)="createTask(column.id)"><mat-icon>add</mat-icon>{{ 'kanban.newTask' | translate }}</button>
                <button mat-menu-item (click)="removeColumn(column.id)"><mat-icon>delete_outline</mat-icon>{{ 'kanban.deleteColumn' | translate }}</button>
              </mat-menu>
            </div>

            <div class="col-tasks"
                 cdkDropList
                 [cdkDropListData]="column.tasks || []"
                 [id]="'column-' + column.id"
                 [cdkDropListConnectedTo]="getConnectedLists()"
                 (cdkDropListDropped)="onTaskDrop($event, column)">

              @for (task of column.tasks || []; track task.id) {
                <div class="task-card" cdkDrag (click)="openTaskDetail(task)">
                  <div class="tc-top">
                    <span class="tc-type" [class]="'type-' + task.type.toLowerCase()">
                      <mat-icon>{{ getTypeIcon(task.type) }}</mat-icon>
                    </span>
                    <span class="tc-key">{{ task.taskKey }}</span>
                  </div>
                  <p class="tc-title">{{ task.title }}</p>
                  <div class="tc-bottom">
                    <div class="tc-labels">
                      @for (label of task.labels || []; track label.id) {
                        <span class="tc-label-dot" [style.background]="label.color" [matTooltip]="label.name"></span>
                      }
                    </div>
                    <div class="tc-meta">
                      @if (task.dueDate) {
                        <span class="tc-due" [class.overdue]="isOverdue(task.dueDate)">
                          <mat-icon>schedule</mat-icon>{{ formatDate(task.dueDate) }}
                        </span>
                      }
                      @if (task.commentCount > 0) {
                        <span class="tc-comments"><mat-icon>chat_bubble_outline</mat-icon>{{ task.commentCount }}</span>
                      }
                    </div>
                  </div>
                  @if (task.assignees?.length) {
                    <div class="tc-assignees">
                      @for (a of task.assignees.slice(0, 3); track a.id) {
                        <div class="mini-avatar" [matTooltip]="a.firstName + ' ' + a.lastName">{{ a.firstName[0] }}{{ a.lastName[0] }}</div>
                      }
                      @if (task.assignees.length > 3) { <span class="more-count">+{{ task.assignees.length - 3 }}</span> }
                    </div>
                  }
                  <div class="tc-priority-bar" [class]="'pb-' + task.priority.toLowerCase()"></div>
                </div>
              }
            </div>

            <button class="add-card-btn" (click)="createTask(column.id)">
              <mat-icon>add</mat-icon> {{ 'kanban.newTask' | translate }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .kanban {
      height: calc(100vh - var(--header-height) - var(--space-12));
      display: flex; flex-direction: column;
    }

    .kanban-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--space-5); flex-shrink: 0;
      h2 { font-size: 1.125rem; font-weight: 700; letter-spacing: -0.01em; }
      .kanban-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
    }

    .board {
      display: flex; gap: var(--space-4); flex: 1;
      overflow-x: auto; padding-bottom: var(--space-4);
    }

    .column {
      min-width: 288px; width: 288px; flex-shrink: 0;
      background: var(--bg-tertiary); border-radius: var(--radius-lg);
      display: flex; flex-direction: column;
      max-height: 100%;
    }

    .column-head {
      display: flex; align-items: center; gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      flex-shrink: 0;
    }
    .col-dot { width: 8px; min-width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .column-head h3 {
      font-size: 0.8125rem; font-weight: 600;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .col-count {
      font-size: 0.625rem; font-weight: 700;
      background: var(--border-primary); color: var(--text-tertiary);
      padding: 1px 7px; border-radius: var(--radius-full);
    }
    .col-spacer { flex: 1; }
    .col-menu-trigger {
      width: 26px; height: 26px; border-radius: var(--radius-sm);
      border: none; background: transparent; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); opacity: 0;
      transition: opacity var(--transition-fast);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .column:hover .col-menu-trigger { opacity: 1; }

    .col-tasks {
      flex: 1; overflow-y: auto;
      padding: 0 var(--space-2); min-height: 48px;
    }

    .task-card {
      background: var(--bg-card); border: 1px solid var(--border-primary);
      border-radius: var(--radius); padding: var(--space-3);
      margin-bottom: var(--space-2); cursor: grab; position: relative;
      transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
      overflow: hidden;
      &:hover { box-shadow: var(--shadow-sm); border-color: var(--border-focus); }
      &:active { cursor: grabbing; }
    }

    .tc-top { display: flex; align-items: center; gap: var(--space-1); margin-bottom: var(--space-1); }
    .tc-type { flex-shrink: 0; mat-icon { font-size: 14px; width: 14px; height: 14px; } }
    .tc-key { font-size: 0.625rem; font-weight: 600; color: var(--text-muted); font-family: monospace; }

    .tc-title {
      font-size: 0.8125rem; font-weight: 500; line-height: 1.45; margin: 0 0 var(--space-2) 0;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden; word-break: break-word;
    }

    .tc-bottom { display: flex; align-items: center; justify-content: space-between; }
    .tc-labels { display: flex; gap: 3px; }
    .tc-label-dot { width: 7px; min-width: 7px; height: 7px; border-radius: 50%; }
    .tc-meta { display: flex; align-items: center; gap: var(--space-2); }
    .tc-due, .tc-comments {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.625rem; color: var(--text-muted);
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
    }
    .tc-due.overdue { color: var(--danger); }

    .tc-assignees { display: flex; margin-top: var(--space-2); }
    .mini-avatar {
      width: 22px; height: 22px; border-radius: var(--radius-full);
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; font-size: 0.5rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--bg-card); margin-left: -4px;
      &:first-child { margin-left: 0; }
    }
    .more-count { font-size: 0.625rem; color: var(--text-muted); margin-left: var(--space-1); }

    .tc-priority-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; }
    .pb-critical { background: #dc2626; }
    .pb-high { background: #f97316; }
    .pb-medium { background: #eab308; }
    .pb-low { background: #10b981; }
    .pb-none { background: transparent; }

    .add-card-btn {
      display: flex; align-items: center; justify-content: center; gap: var(--space-1);
      padding: var(--space-2); margin: var(--space-2);
      border: 1px dashed var(--border-primary); border-radius: var(--radius);
      background: none; color: var(--text-muted); cursor: pointer;
      font-size: 0.75rem; transition: all var(--transition-fast);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-surface); }
    }

    .cdk-drag-preview { box-shadow: var(--shadow-lg); border-radius: var(--radius); opacity: 0.95; }
    .cdk-drag-placeholder { opacity: 0.25; }
    .cdk-drag-animating { transition: transform 200ms cubic-bezier(0, 0, 0.2, 1); }
    .col-tasks.cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
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
      next: (res) => { if (res.success) this.board.set(res.data); }
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
      this.taskService.moveTask(task.id, { columnId: targetColumn.id, position: event.currentIndex }).subscribe({
        error: () => this.loadBoard()
      });
    }
  }

  createTask(columnId: number): void {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '600px',
      data: { projectId: this.projectId, columnId, mode: 'create' }
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadBoard(); });
  }

  openTaskDetail(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '700px',
      data: { task, projectId: this.projectId, mode: 'edit' }
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadBoard(); });
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

  isOverdue(dateStr: string): boolean { return new Date(dateStr) < new Date(); }

  private get locale(): string {
    const map: Record<string, string> = { tr: 'tr-TR', en: 'en-US' };
    return map[this.translate.currentLang] || 'en-US';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.locale, { month: 'short', day: 'numeric' });
  }
}
