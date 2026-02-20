import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { Member, ProjectRole } from '../../core/models';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, MatCardModule, MatIconModule, MatButtonModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, ReactiveFormsModule
  ],
  template: `
    <div class="team-page">
      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="40"></mat-spinner><p>{{ 'team.loadingTeam' | translate }}</p></div>
      } @else {
        <div class="page-header">
          <div>
            <h1>{{ 'team.title' | translate }}</h1>
            <p class="header-subtitle">{{ 'team.subtitle' | translate }}</p>
          </div>
          <button mat-flat-button color="primary" (click)="openInviteDialog()">
            <mat-icon>person_add</mat-icon>
            {{ 'team.inviteMember' | translate }}
          </button>
        </div>

        <div class="members-card">
          @if (members().length) {
            @for (member of members(); track member.id) {
              <div class="member-row">
                <div class="member-avatar" [class]="'role-' + member.role.toLowerCase()">{{ getInitials(member) }}</div>
                <div class="member-info">
                  <span class="member-name">{{ member.firstName }} {{ member.lastName }}</span>
                  <span class="member-email">{{ member.email }}</span>
                </div>
                <span class="role-badge" [class]="'role-' + member.role.toLowerCase()">{{ member.role }}</span>
                <span class="joined-date">{{ formatDate(member.joinedAt) }}</span>
              </div>
            }
          } @else {
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>people_outline</mat-icon></div>
              <p>{{ 'team.noMembers' | translate }}</p>
              <button mat-stroked-button (click)="openInviteDialog()">{{ 'team.inviteFirst' | translate }}</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .team-page { max-width: 860px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4);
    }
    .page-header h1 { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; }
    .header-subtitle { color: var(--text-tertiary); font-size: 0.875rem; margin-top: var(--space-1); }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-16); color: var(--text-muted); gap: var(--space-4);
    }

    .members-card {
      background: var(--bg-card); border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg); overflow: hidden;
    }

    .member-row {
      display: flex; align-items: center; gap: var(--space-4);
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--border-secondary);
      transition: background var(--transition-fast);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--hover-bg); }
    }

    .member-avatar {
      width: 36px; height: 36px; border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.75rem; color: white; flex-shrink: 0;
      &.role-owner { background: #7c3aed; }
      &.role-admin { background: #2563eb; }
      &.role-member { background: #10b981; }
      &.role-viewer { background: #64748b; }
    }

    .member-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .member-name { font-weight: 500; font-size: 0.875rem; color: var(--text-primary); }
    .member-email { font-size: 0.75rem; color: var(--text-muted); }

    .role-badge {
      font-size: 0.6875rem; font-weight: 600; padding: 3px 10px; border-radius: var(--radius-full);
      &.role-owner { background: rgba(124,58,237,0.1); color: #7c3aed; }
      &.role-admin { background: rgba(37,99,235,0.1); color: #2563eb; }
      &.role-member { background: rgba(16,185,129,0.1); color: #10b981; }
      &.role-viewer { background: rgba(100,116,139,0.1); color: #64748b; }
    }

    .joined-date { font-size: 0.75rem; color: var(--text-muted); flex-shrink: 0; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: var(--space-16) var(--space-6); text-align: center;
    }
    .empty-icon {
      width: 56px; height: 56px; border-radius: var(--radius-xl); background: var(--bg-tertiary);
      display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);
      mat-icon { font-size: 24px; width: 24px; height: 24px; color: var(--text-muted); }
    }
    .empty-state p { color: var(--text-secondary); margin-bottom: var(--space-4); }
  `]
})
export class TeamComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  loading = signal(true);
  members = signal<Member[]>([]);
  projectId = computed(() => { const id = this.route.snapshot.paramMap.get('projectId'); return id ? +id : 0; });

  ngOnInit(): void { this.loadMembers(); }

  loadMembers(): void {
    const pid = this.projectId();
    if (pid) {
      this.projectService.getMembers(pid).subscribe({
        next: (res) => { if (res.success) this.members.set(res.data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else { this.loading.set(false); }
  }

  getInitials(member: Member): string {
    return ((member.firstName?.charAt(0) ?? '') + (member.lastName?.charAt(0) ?? '')).toUpperCase() || (member.email?.charAt(0)?.toUpperCase() ?? '?');
  }

  private get locale(): string { const map: Record<string, string> = { tr: 'tr-TR', en: 'en-US' }; return map[this.translate.currentLang] || 'en-US'; }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.locale, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  openInviteDialog(): void {
    const dialogRef = this.dialog.open(InviteMemberDialogComponent, { width: '400px', data: { projectId: this.projectId() } });
    dialogRef.afterClosed().subscribe(result => { if (result === true) this.loadMembers(); });
  }
}

@Component({
  selector: 'app-invite-member-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>{{ 'team.inviteDialog.title' | translate }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ 'team.inviteDialog.emailLabel' | translate }}</mat-label>
        <input matInput [formControl]="emailControl" [placeholder]="'team.inviteDialog.emailPlaceholder' | translate" type="email" />
        @if (emailControl.hasError('required') && emailControl.touched) { <mat-error>{{ 'team.inviteDialog.emailRequired' | translate }}</mat-error> }
        @if (emailControl.hasError('email') && emailControl.touched) { <mat-error>{{ 'team.inviteDialog.emailInvalid' | translate }}</mat-error> }
      </mat-form-field>
      @if (errorMessage()) { <p class="error-text">{{ errorMessage() }}</p> }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="invite()" [disabled]="inviting() || emailControl.invalid">
        {{ inviting() ? ('team.inviteDialog.inviting' | translate) : ('team.inviteDialog.invite' | translate) }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.w-full { width: 100%; } .error-text { color: var(--danger); font-size: 0.8125rem; margin-top: -8px; }`]
})
export class InviteMemberDialogComponent {
  private readonly translate = inject(TranslateService);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly dialogRef = inject(MatDialogRef<InviteMemberDialogComponent>);
  readonly data = inject<{ projectId: number }>(MAT_DIALOG_DATA);

  emailControl = new FormControl('', [Validators.required, Validators.email]);
  inviting = signal(false);
  errorMessage = signal<string | null>(null);

  invite(): void {
    const email = this.emailControl.value?.trim();
    if (!email || this.emailControl.invalid || !this.data.projectId) return;
    this.inviting.set(true);
    this.errorMessage.set(null);
    this.userService.searchByEmail(email).subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          this.projectService.addMember(this.data.projectId, res.data[0].id, 'MEMBER').subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => { this.errorMessage.set(err.error?.message ?? this.translate.instant('team.inviteDialog.failedAdd')); this.inviting.set(false); }
          });
        } else { this.errorMessage.set(this.translate.instant('team.inviteDialog.noUserFound')); this.inviting.set(false); }
      },
      error: () => { this.errorMessage.set(this.translate.instant('team.inviteDialog.failedSearch')); this.inviting.set(false); }
    });
  }
}
