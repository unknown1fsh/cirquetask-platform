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
    CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatChipsModule,
    ReactiveFormsModule, TranslateModule
  ],
  template: `
    <div class="projects-page">
      <div class="page-header">
        <div class="header-left">
          <h1>{{ 'projects.title' | translate }}</h1>
          <span class="count-pill">{{ projects().length }}</span>
        </div>
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          {{ 'projects.newProject' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="loading-placeholder">
          <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
        </div>
      } @else if (projects().length === 0) {
        <div class="empty-state">
          <div class="empty-icon"><mat-icon>folder_open</mat-icon></div>
          <h3>{{ 'projects.noProjects' | translate }}</h3>
          <p>{{ 'projects.noProjectsHint' | translate }}</p>
          <button mat-flat-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            {{ 'projects.newProject' | translate }}
          </button>
        </div>
      } @else {
        <div class="project-grid">
          @for (project of projects(); track project.id) {
            <a [routerLink]="['/projects', project.id]" class="project-card">
              <div class="card-top">
                <span class="color-bar" [style.background]="project.color"></span>
                <h3>{{ project.name }}</h3>
              </div>
              @if (project.description) {
                <p class="card-desc">{{ project.description }}</p>
              }
              <div class="card-stats">
                <span class="stat"><mat-icon>people_outline</mat-icon>{{ project.memberCount }}</span>
                <span class="stat"><mat-icon>task_alt</mat-icon>{{ project.taskCount }}</span>
              </div>
              <div class="card-bottom">
                <span class="prefix-tag">{{ project.prefix }}</span>
                <span class="date">{{ formatDate(project.createdAt) }}</span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .projects-page { max-width: var(--content-max-width); margin: 0 auto; }

    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4);
    }
    .header-left { display: flex; align-items: center; gap: var(--space-3); }
    .header-left h1 { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; }
    .count-pill {
      background: var(--primary-surface); color: var(--primary);
      font-size: 0.6875rem; font-weight: 700;
      padding: 3px 10px; border-radius: var(--radius-full);
    }

    .project-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);
    }

    .project-card {
      display: flex; flex-direction: column;
      background: var(--bg-card); border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg); padding: var(--space-5);
      text-decoration: none; color: inherit;
      transition: box-shadow var(--transition-base), transform var(--transition-base);
      cursor: pointer;
      &:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
    }

    .card-top {
      display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3);
    }
    .color-bar { width: 4px; height: 24px; border-radius: 2px; flex-shrink: 0; }
    .card-top h3 {
      font-size: 0.9375rem; font-weight: 600; color: var(--text-primary);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
    }

    .card-desc {
      font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;
      margin-bottom: var(--space-4);
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .card-stats {
      display: flex; gap: var(--space-4); margin-bottom: var(--space-4);
    }
    .stat {
      display: flex; align-items: center; gap: var(--space-1);
      font-size: 0.75rem; color: var(--text-tertiary);
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }

    .card-bottom {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: var(--space-3); border-top: 1px solid var(--border-secondary);
    }
    .prefix-tag {
      font-size: 0.6875rem; font-weight: 700; color: var(--primary);
      background: var(--primary-surface); padding: 2px 8px; border-radius: var(--radius-xs);
      font-family: monospace;
    }
    .date { font-size: 0.6875rem; color: var(--text-muted); }

    .loading-placeholder { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
    .skeleton-card {
      height: 160px; border-radius: var(--radius-lg);
      background: var(--bg-tertiary); animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-16) var(--space-6); text-align: center;
      background: var(--bg-card); border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
    }
    .empty-icon {
      width: 64px; height: 64px; border-radius: var(--radius-xl);
      background: var(--bg-tertiary);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: var(--space-5);
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: var(--text-muted); }
    }
    .empty-state h3 { font-size: 1.0625rem; font-weight: 600; margin-bottom: var(--space-2); }
    .empty-state p { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: var(--space-6); }

    @media (max-width: 1024px) { .project-grid, .loading-placeholder { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) {
      .project-grid, .loading-placeholder { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: stretch; }
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
        if (res.success) this.projects.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      width: '480px', maxWidth: '95vw'
    });
    dialogRef.afterClosed().subscribe((created) => {
      if (created) this.loadProjects();
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

@Component({
  selector: 'app-create-project-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, TranslateModule
  ],
  template: `
    <div class="dialog">
      <div class="dialog-top">
        <h2>{{ 'projects.createDialog.title' | translate }}</h2>
        <button class="close-btn" (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
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
          <div class="color-field">
            <label>{{ 'projects.createDialog.color' | translate }}</label>
            <div class="color-row">
              <input type="color" [value]="form.get('color')?.value" (input)="form.patchValue({ color: $any($event.target).value })" class="color-input">
              <span class="color-hex">{{ form.get('color')?.value }}</span>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button mat-button type="button" (click)="dialogRef.close()">{{ 'common.cancel' | translate }}</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
            {{ submitting() ? ('projects.createDialog.creating' | translate) : ('projects.createDialog.createProject' | translate) }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-top {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--border-primary);
      h2 { font-size: 1.0625rem; font-weight: 600; }
    }
    .close-btn {
      width: 32px; height: 32px; border-radius: var(--radius);
      border: none; background: transparent; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-tertiary);
      &:hover { background: var(--hover-bg); }
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .dialog-body { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    .color-field label { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); margin-bottom: var(--space-2); }
    .color-row { display: flex; align-items: center; gap: var(--space-3); }
    .color-input { width: 40px; height: 32px; padding: 2px; border: 1px solid var(--border-primary); border-radius: var(--radius-sm); cursor: pointer; }
    .color-hex { font-size: 0.75rem; color: var(--text-muted); font-family: monospace; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: var(--space-3); padding: var(--space-4) var(--space-6); border-top: 1px solid var(--border-primary); }
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
        if (res.success) this.dialogRef.close(true);
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
