import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SessionsStore } from '../../sessions.store';
import { OrganizationsStore } from '../../../organizations/organizations.store';
import { SessionSummary } from '../../../../core/models/session.models';
@Component({
  selector: 'app-session-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, DialogModule, TagModule, MessageModule, FormsModule, RouterLink, ConfirmDialogModule, DatePipe, DecimalPipe],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="page-header">
      <h2>Sessions</h2>
    </div>
    @if (store.error(); as err) {
      <div style="margin-bottom:1rem">
        <p-message severity="error" [text]="err.message" styleClass="w-full" />
      </div>
    }
    <p-table [value]="store.sessions()" [loading]="store.loading()" stripedRows [paginator]="true" [rows]="20">
      <ng-template #header>
        <tr><th>Status</th><th>Mode</th><th>Hits</th><th>Misses</th><th>Accuracy</th><th>Avg Reaction</th><th>Duration</th><th>Started</th><th>Actions</th></tr>
      </ng-template>
      <ng-template #body let-session>
        <tr>
          <td><p-tag [value]="session.status" [severity]="statusSeverity(session.status)" /></td>
          <td>{{ session.trainingMode }}</td>
          <td>{{ session.hitCount }}</td>
          <td>{{ session.missCount }}</td>
          <td>{{ session.accuracyPercent !== null ? (session.accuracyPercent | number:'1.1-1') + '%' : '—' }}</td>
          <td>{{ session.avgReactionMs !== null ? session.avgReactionMs + 'ms' : '—' }}</td>
          <td>{{ formatDuration(session.durationMs) }}</td>
          <td>{{ session.sessionStartedAt | date:'short' }}</td>
          <td style="display:flex;gap:0.5rem">
            <p-button icon="pi pi-eye" size="small" [text]="true" [routerLink]="['/sessions', session.id]" />
            @if (orgStore.canDeleteSession()) {
              <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="confirmDelete(session)" />
            }
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr><td colspan="9" style="text-align:center">No sessions found.</td></tr>
      </ng-template>
    </p-table>
    <p-confirmDialog />
  `
})
export class SessionListComponent implements OnInit {
  protected readonly store = inject(SessionsStore);
  protected readonly orgStore = inject(OrganizationsStore);
  private readonly confirmSvc = inject(ConfirmationService);
  ngOnInit(): void {
    const orgId = this.orgStore.selectedOrganizationId();
    if (orgId) { this.store.updateFilters({ organizationId: orgId }); this.store.loadSessions(); }
  }
  statusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' {
    if (status === 'COMPLETED') return 'success';
    if (status === 'FAILED') return 'danger';
    if (status === 'CANCELLED') return 'warn';
    return 'secondary';
  }
  formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  }
  confirmDelete(session: SessionSummary): void {
    this.confirmSvc.confirm({
      message: `Delete session from ${new Date(session.sessionStartedAt).toLocaleDateString()}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.store.deleteSession(session.id)
    });
  }
}
