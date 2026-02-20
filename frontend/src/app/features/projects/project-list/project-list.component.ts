import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../../core/services/project.service';
import { Project, ProjectRequest } from '../../../core/models';
import { applyServerValidationErrors } from '../../../core/utils/form.util';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  template: `
    <div class="project-list">
      <div class="page-header">
        <div class="header-content">
          <h1>{{ 'projects.title' | translate }}</h1>
          <span class="count-badge">{{ projects().length }}</span>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          {{ 'projects.newProject' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-icon>hourglass_empty</mat-icon>
          <p>{{ 'projects.loadingProjects' | translate }}</p>
        </div>
      } @else if (projects().length === 0) {
        <div class="empty-state cirquetask-card">
          <mat-icon>folder_open</mat-icon>
          <h3>{{ 'projects.noProjects' | translate }}</h3>
          <p class="text-muted">{{ 'projects.noProjectsHint' | translate }}</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            {{ 'projects.newProject' | translate }}
          </button>
        </div>
      } @else {
        <div class="project-grid">
          @for (project of projects(); track project.id) {
            <a [routerLink]="['/projects', project.id]" class="project-card cirquetask-card">
              <div class="card-header">
                <span class="color-dot" [style.background-color]="project.color"></span>
                <h3>{{ project.name }}</h3>
              </div>
              @if (project.description) {
                <p class="description">{{ project.description }}</p>
              }
              <div class="card-meta">
                <span class="meta-item">
                  <mat-icon>people</mat-icon>
                  {{ project.memberCount }}
                </span>
                <span class="meta-item">
                  <mat-icon>task_alt</mat-icon>
                  {{ project.taskCount }}
                </span>
              </div>
              <div class="card-footer">
                <span class="prefix">{{ project.prefix }}</span>
                <span class="date text-muted">{{ formatDate(project.createdAt) }}</span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .project-list { max-width: 1400px; margin: 0 auto; }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-content h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .count-badge {
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 12px;
    }

    .project-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .project-card {
      display: block;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .project-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .card-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0 0 16px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .meta-item mat-icon {
      font-size: 16px;
      width: 16px;
      min-width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
    }

    .prefix {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
    }

    .date {
      font-size: 0.75rem;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }

    .loading-state > mat-icon, .empty-state > mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--text-muted);
      opacity: 0.5;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }

    .empty-state p {
      margin: 0 0 24px 0;
    }

    @media (max-width: 1024px) {
      .project-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .project-grid {
        grid-template-columns: 1fr;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  private dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  projects = signal<Project[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.projectService.getProjects().subscribe({
      next: (res) => {
        if (res.success) {
          this.projects.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      width: '480px',
      maxWidth: '95vw'
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.loadProjects();
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return this.translate.instant('common.today');
    if (diffDays === 1) return this.translate.instant('common.yesterday');
    if (diffDays < 7) return this.translate.instant('common.daysAgo', { count: diffDays });
    const localeMap: Record<string, string> = { tr: 'tr-TR', en: 'en-US' };
    const locale = localeMap[this.translate.currentLang] || 'en-US';
    return date.toLocaleDateString(locale);
  }
}

// Create Project Dialog Component (inline)
@Component({
  selector: 'app-create-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="create-dialog">
      <div class="dialog-header">
        <h2>{{ 'projects.createDialog.title' | translate }}</h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="dialog-body">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'projects.createDialog.name' | translate }}</mat-label>
            <input matInput formControlName="name" [placeholder]="'projects.createDialog.namePlaceholder' | translate">
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>{{ 'projects.createDialog.nameRequired' | translate }}</mat-error>
            }
            @if (form.get('name')?.hasError('serverError')) {
              <mat-error>{{ form.get('name')?.getError('serverError') }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'projects.createDialog.description' | translate }}</mat-label>
            <textarea matInput formControlName="description" rows="3" [placeholder]="'projects.createDialog.descriptionPlaceholder' | translate"></textarea>
            @if (form.get('description')?.hasError('serverError')) {
              <mat-error>{{ form.get('description')?.getError('serverError') }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'projects.createDialog.prefix' | translate }}</mat-label>
            <input matInput formControlName="prefix" [placeholder]="'projects.createDialog.prefixPlaceholder' | translate" maxlength="6">
            <mat-hint>{{ 'projects.createDialog.prefixHint' | translate }}</mat-hint>
            @if (form.get('prefix')?.hasError('required') && form.get('prefix')?.touched) {
              <mat-error>{{ 'projects.createDialog.prefixRequired' | translate }}</mat-error>
            }
            @if (form.get('prefix')?.hasError('serverError')) {
              <mat-error>{{ form.get('prefix')?.getError('serverError') }}</mat-error>
            }
          </mat-form-field>

          <div class="color-picker-field">
            <label>{{ 'projects.createDialog.color' | translate }}</label>
            <div class="color-picker-row">
              <input
                type="color"
                [value]="form.get('color')?.value"
                (input)="form.patchValue({ color: $any($event.target).value })"
                class="color-input"
              >
              <span class="color-value">{{ form.get('color')?.value }}</span>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button mat-button type="button" (click)="dialogRef.close()">{{ 'common.cancel' | translate }}</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
            @if (submitting()) {
              {{ 'projects.createDialog.creating' | translate }}
            } @else {
              {{ 'projects.createDialog.createProject' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-dialog { padding: 0; }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .dialog-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .dialog-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .w-full { width: 100%; }

    .color-picker-field label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .color-picker-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .color-input {
      width: 48px;
      height: 36px;
      padding: 2px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      background: var(--bg-card);
    }

    .color-value {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class CreateProjectDialogComponent {
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  dialogRef = inject(MatDialogRef<CreateProjectDialogComponent>);
  submitting = signal(false);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    prefix: ['', [Validators.required, Validators.maxLength(6)]],
    color: ['#6366f1']
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const request: ProjectRequest = {
      name: this.form.value.name,
      description: this.form.value.description || undefined,
      prefix: this.form.value.prefix.toUpperCase(),
      color: this.form.value.color
    };

    this.submitting.set(true);
    this.projectService.createProject(request).subscribe({
      next: (res) => {
        if (res.success) {
          this.dialogRef.close(true);
        }
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        const data = err.error?.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          applyServerValidationErrors(this.form, data as Record<string, string>);
        }
      }
    });
  }
}
