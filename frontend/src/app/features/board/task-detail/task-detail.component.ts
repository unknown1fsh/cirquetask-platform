import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TaskService } from '../../../core/services/task.service';
import { AttachmentService } from '../../../core/services/attachment.service';
import { LabelService } from '../../../core/services/label.service';
import { Task, Comment, Attachment, Label, TaskRequest } from '../../../core/models';
import { applyServerValidationErrors } from '../../../core/utils/form.util';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatChipsModule, MatDividerModule, TranslateModule
  ],
  template: `
    <div class="task-dialog">
      <div class="dialog-header">
        <h2>{{ data.mode === 'create' ? ('taskDetail.createTask' | translate) : data.task?.taskKey }}</h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        <div class="dialog-body">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'taskDetail.title' | translate }}</mat-label>
            <input matInput formControlName="title" [placeholder]="'taskDetail.titlePlaceholder' | translate">
            @if (taskForm.get('title')?.hasError('serverError')) {
              <mat-error>{{ taskForm.get('title')?.getError('serverError') }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'taskDetail.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="4" [placeholder]="'taskDetail.descriptionPlaceholder' | translate"></textarea>
            @if (taskForm.get('description')?.hasError('serverError')) {
              <mat-error>{{ taskForm.get('description')?.getError('serverError') }}</mat-error>
            }
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'taskDetail.type' | translate }}</mat-label>
              <mat-select formControlName="type">
                <mat-option value="TASK">{{ 'common.type.TASK' | translate }}</mat-option>
                <mat-option value="BUG">{{ 'common.type.BUG' | translate }}</mat-option>
                <mat-option value="FEATURE">{{ 'common.type.FEATURE' | translate }}</mat-option>
                <mat-option value="IMPROVEMENT">{{ 'common.type.IMPROVEMENT' | translate }}</mat-option>
                <mat-option value="EPIC">{{ 'common.type.EPIC' | translate }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'taskDetail.priority' | translate }}</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="CRITICAL">{{ 'common.priority.CRITICAL' | translate }}</mat-option>
                <mat-option value="HIGH">{{ 'common.priority.HIGH' | translate }}</mat-option>
                <mat-option value="MEDIUM">{{ 'common.priority.MEDIUM' | translate }}</mat-option>
                <mat-option value="LOW">{{ 'common.priority.LOW' | translate }}</mat-option>
                <mat-option value="NONE">{{ 'common.priority.NONE' | translate }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'taskDetail.storyPoints' | translate }}</mat-label>
              <input matInput type="number" formControlName="storyPoints" min="0">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'taskDetail.dueDate' | translate }}</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dueDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>

          <!-- Subtasks section for edit mode -->
          @if (data.mode === 'edit' && data.task) {
            <mat-divider></mat-divider>
            <div class="subtasks-section">
              <h3>{{ 'taskDetail.subtasks' | translate }}</h3>
              @for (st of taskSubtasks(); track st.id) {
                <div class="subtask-row">
                  <mat-icon class="subtask-icon">{{ st.status === 'DONE' ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                  <span class="subtask-title">{{ st.title }}</span>
                </div>
              }
              @if (taskSubtasks().length === 0) {
                <p class="text-muted">{{ 'taskDetail.noSubtasks' | translate }}</p>
              }
              <button mat-stroked-button type="button" (click)="openAddSubtask()">
                <mat-icon>add</mat-icon> {{ 'taskDetail.addSubtask' | translate }}
              </button>
            </div>
          }

          <!-- Labels section for edit mode -->
          @if (data.mode === 'edit' && data.task) {
            <mat-divider></mat-divider>
            <div class="labels-section">
              <h3>{{ 'taskDetail.labels' | translate }}</h3>
              <div class="label-chips">
                @for (label of taskLabels(); track label.id) {
                  <span class="label-chip" [style.background-color]="label.color || '#6366f1'" [style.color]="'#fff'">
                    {{ label.name }}
                    <button type="button" mat-icon-button class="chip-remove" (click)="removeLabel(label)" [attr.aria-label]="'common.delete' | translate">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </span>
                }
              </div>
              @if (availableLabelsToAdd.length > 0) {
                <mat-form-field appearance="outline" class="add-label-field">
                  <mat-label>{{ 'taskDetail.addLabel' | translate }}</mat-label>
                  <mat-select #labelSelect (selectionChange)="onAddLabel($event.value); labelSelect.value = null">
                    <mat-option [value]="null" disabled>{{ 'taskDetail.selectLabel' | translate }}</mat-option>
                    @for (label of availableLabelsToAdd; track label.id) {
                      <mat-option [value]="label.id">{{ label.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }
            </div>
          }

          <!-- Comments section for edit mode -->
          @if (data.mode === 'edit') {
            <mat-divider></mat-divider>
            <div class="comments-section">
              <h3>{{ 'taskDetail.comments' | translate }}</h3>
              @for (comment of comments(); track comment.id) {
                <div class="comment">
                  <div class="comment-header">
                    <strong>{{ comment.author.firstName }} {{ comment.author.lastName }}</strong>
                    <small class="text-muted">{{ formatTime(comment.createdAt) }}</small>
                  </div>
                  <p>{{ comment.content }}</p>
                </div>
              }
              <div class="add-comment">
                <mat-form-field appearance="outline" class="w-full">
                  <input matInput [placeholder]="'taskDetail.addComment' | translate" #commentInput
                         (keydown.enter)="addComment(commentInput.value); commentInput.value = ''">
                  <mat-icon matSuffix class="send-icon" (click)="addComment(commentInput.value); commentInput.value = ''">send</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>
            <div class="attachments-section">
              <h3>{{ 'taskDetail.attachments' | translate }}</h3>
              @if (attachmentsLoading()) {
                <p class="text-muted">{{ 'common.loading' | translate }}</p>
              } @else {
                @for (att of attachments(); track att.id) {
                  <div class="attachment-row">
                    <a (click)="downloadAttachment(att)" class="attachment-link">{{ att.fileName }}</a>
                    <span class="attachment-size">{{ formatFileSize(att.fileSize) }}</span>
                    <button mat-icon-button type="button" color="warn" (click)="removeAttachment(att)" [attr.aria-label]="'common.delete' | translate">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
                @if (attachments().length === 0) {
                  <p class="text-muted">{{ 'taskDetail.noAttachments' | translate }}</p>
                }
              }
              <div class="upload-row">
                <input #fileInput type="file" hidden (change)="onFileSelected($event)" multiple>
                <button mat-stroked-button type="button" (click)="fileInput.click()">
                  <mat-icon>upload_file</mat-icon> {{ 'taskDetail.uploadAttachment' | translate }}
                </button>
              </div>
            </div>
          }
        </div>

        <div class="dialog-footer">
          @if (data.mode === 'edit') {
            <button mat-button type="button" color="warn" (click)="deleteTask()">
              <mat-icon>delete</mat-icon> {{ 'common.delete' | translate }}
            </button>
          }
          <span class="spacer"></span>
          <button mat-button type="button" (click)="dialogRef.close()">{{ 'common.cancel' | translate }}</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="taskForm.invalid">
            {{ data.mode === 'create' ? ('common.create' | translate) : ('common.save' | translate) }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .task-dialog { width: 100%; }
    .dialog-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px; border-bottom: 1px solid var(--border-color);
      h2 { font-size: 1.1rem; font-weight: 700; }
    }
    .dialog-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
    .form-row { display: flex; gap: 12px; mat-form-field { flex: 1; } }
    .dialog-footer {
      display: flex; align-items: center; gap: 8px;
      padding: 16px 24px; border-top: 1px solid var(--border-color);
    }
    .spacer { flex: 1; }
    .comments-section { margin-top: 16px; h3 { font-weight: 600; margin-bottom: 12px; } }
    .comment {
      padding: 10px 0; border-bottom: 1px solid var(--border-color);
      .comment-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
      p { font-size: 0.9rem; }
    }
    .add-comment { margin-top: 12px; }
    .send-icon { cursor: pointer; color: var(--primary); width: 24px; min-width: 24px; height: 24px; flex-shrink: 0; }
    .attachments-section { margin-top: 16px; h3 { font-weight: 600; margin-bottom: 12px; } }
    .attachment-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
    .attachment-link { cursor: pointer; color: var(--primary); text-decoration: none; flex: 1; overflow: hidden; text-overflow: ellipsis; }
    .attachment-size { font-size: 0.85rem; color: var(--text-muted); }
    .upload-row { margin-top: 8px; }
    .labels-section { margin-top: 16px; h3 { font-weight: 600; margin-bottom: 12px; } }
    .label-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
    .label-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 8px; border-radius: 16px; font-size: 0.875rem;
      .chip-remove { width: 20px; height: 20px; line-height: 20px; mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    }
    .add-label-field { width: 100%; max-width: 240px; }
    .subtasks-section { margin-top: 16px; h3 { font-weight: 600; margin-bottom: 12px; } }
    .subtask-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
    .subtask-icon { font-size: 20px; width: 20px; height: 20px; color: var(--text-muted); }
    .subtask-title { font-size: 0.9rem; }
  `]
})
export class TaskDetailComponent implements OnInit {
  taskForm: FormGroup;
  comments = signal<Comment[]>([]);
  attachments = signal<Attachment[]>([]);
  attachmentsLoading = signal(false);
  projectLabels = signal<Label[]>([]);
  taskLabels = signal<Label[]>([]);
  taskSubtasks = signal<Task[]>([]);

  constructor(
    public dialogRef: MatDialogRef<TaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task; projectId: number; columnId?: number; mode: 'create' | 'edit'; parentTaskId?: number },
    private fb: FormBuilder,
    private taskService: TaskService,
    private attachmentService: AttachmentService,
    private labelService: LabelService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.taskForm = this.fb.group({
      title: [data.task?.title || '', Validators.required],
      description: [data.task?.description || ''],
      type: [data.task?.type || 'TASK'],
      priority: [data.task?.priority || 'MEDIUM'],
      storyPoints: [data.task?.storyPoints || 0],
      dueDate: [data.task?.dueDate ? new Date(data.task.dueDate) : null]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.task) {
      this.taskLabels.set(this.data.task.labels ?? []);
      this.taskSubtasks.set(this.data.task.subtasks ?? []);
      this.loadComments();
      this.loadAttachments();
      this.loadProjectLabels();
    }
  }

  loadSubtasks(): void {
    if (!this.data.task) return;
    this.taskService.getTask(this.data.task.id).subscribe({
      next: (res) => { if (res.success && res.data.subtasks) this.taskSubtasks.set(res.data.subtasks); }
    });
  }

  openAddSubtask(): void {
    if (!this.data.task) return;
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '600px',
      data: {
        projectId: this.data.projectId,
        columnId: this.data.task.columnId ?? undefined,
        parentTaskId: this.data.task.id,
        mode: 'create'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadSubtasks();
    });
  }

  get availableLabelsToAdd(): Label[] {
    const onTask = new Set(this.taskLabels().map(l => l.id));
    return this.projectLabels().filter(l => !onTask.has(l.id));
  }

  loadComments(): void {
    if (this.data.task) {
      this.taskService.getComments(this.data.task.id).subscribe({
        next: (res) => { if (res.success) this.comments.set(res.data); }
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;
    const request: TaskRequest = {
      title: formValue.title,
      description: formValue.description ?? undefined,
      priority: formValue.priority,
      type: formValue.type,
      storyPoints: formValue.storyPoints ?? 0,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate).toISOString().split('T')[0] : undefined,
      columnId: this.data.columnId,
      ...(this.data.parentTaskId != null && { parentTaskId: this.data.parentTaskId })
    };

    if (this.data.mode === 'create') {
      this.taskService.createTask(this.data.projectId, request).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          const data = err.error?.data;
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            applyServerValidationErrors(this.taskForm, data as Record<string, string>);
          }
        }
      });
    } else if (this.data.task) {
      this.taskService.updateTask(this.data.task.id, request).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          const data = err.error?.data;
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            applyServerValidationErrors(this.taskForm, data as Record<string, string>);
          }
        }
      });
    }
  }

  addComment(content: string): void {
    if (!content.trim() || !this.data.task) return;
    this.taskService.addComment(this.data.task.id, { content }).subscribe({
      next: () => this.loadComments()
    });
  }

  deleteTask(): void {
    if (this.data.task && confirm(this.translate.instant('taskDetail.deleteConfirm'))) {
      this.taskService.deleteTask(this.data.task.id).subscribe({
        next: () => this.dialogRef.close(true)
      });
    }
  }

  private get locale(): string {
    const map: Record<string, string> = { tr: 'tr-TR', en: 'en-US' };
    return map[this.translate.currentLang] || 'en-US';
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  loadProjectLabels(): void {
    this.labelService.listByProject(this.data.projectId).subscribe({
      next: (res) => { if (res.success) this.projectLabels.set(res.data); }
    });
  }

  onAddLabel(labelId: number | null): void {
    if (!labelId || !this.data.task) return;
    this.taskService.addLabelToTask(this.data.task.id, labelId).subscribe({
      next: (res) => { if (res.success && res.data.labels) this.taskLabels.set(res.data.labels); }
    });
  }

  removeLabel(label: Label): void {
    if (!this.data.task) return;
    this.taskService.removeLabelFromTask(this.data.task.id, label.id).subscribe({
      next: (res) => { if (res.success && res.data.labels) this.taskLabels.set(res.data.labels); }
    });
  }

  loadAttachments(): void {
    if (!this.data.task) return;
    this.attachmentsLoading.set(true);
    this.attachmentService.listByTask(this.data.task.id).subscribe({
      next: (res) => {
        if (res.success) this.attachments.set(res.data);
        this.attachmentsLoading.set(false);
      },
      error: () => this.attachmentsLoading.set(false)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length || !this.data.task) return;
    for (let i = 0; i < files.length; i++) {
      this.attachmentService.upload(this.data.task.id, files[i]).subscribe({
        next: () => this.loadAttachments()
      });
    }
    input.value = '';
  }

  downloadAttachment(att: Attachment): void {
    this.attachmentService.download(att.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = att.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  removeAttachment(att: Attachment): void {
    if (!confirm(this.translate.instant('taskDetail.deleteAttachmentConfirm'))) return;
    this.attachmentService.delete(att.id).subscribe({
      next: () => this.loadAttachments()
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
