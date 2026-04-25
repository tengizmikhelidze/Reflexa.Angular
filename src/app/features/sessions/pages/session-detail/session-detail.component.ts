import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SessionsStore } from '../../sessions.store';
import { OrganizationsStore } from '../../../organizations/organizations.store';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-session-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, TableModule, ButtonModule, TagModule, MessageModule, DialogModule, InputTextModule, FormsModule, DecimalPipe],
  template: `
    @if (store.detailLoading()) {
      <p>Loading session...</p>
    } @else if (store.selectedSession(); as session) {
      <div class="page-header">
        <h2>Session Detail</h2>
        @if (orgStore.canAssignSession()) {
          <p-button label="Assign" icon="pi pi-user" size="small" (onClick)="showAssign = true" />
        }
      </div>
      @if (store.error(); as err) {
        <div style="margin-bottom:1rem">
          <p-message severity="error" [text]="err.message" styleClass="w-full" />
        </div>
      }
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.5rem">
        <p-card>
          <p style="color:var(--app-muted);font-size:0.8rem">STATUS</p>
          <p-tag [value]="session.status" [severity]="statusSeverity(session.status)" />
        </p-card>
        <p-card>
          <p style="color:var(--app-muted);font-size:0.8rem">HITS / MISSES</p>
          <p style="font-size:1.5rem;font-weight:600">{{ session.hitCount }} / {{ session.missCount }}</p>
        </p-card>
        <p-card>
          <p style="color:var(--app-muted);font-size:0.8rem">ACCURACY</p>
          <p style="font-size:1.5rem;font-weight:600">{{ session.accuracyPercent !== null ? (session.accuracyPercent | number:'1.1-1') + '%' : '—' }}</p>
        </p-card>
        <p-card>
          <p style="color:var(--app-muted);font-size:0.8rem">AVG REACTION</p>
          <p style="font-size:1.5rem;font-weight:600">{{ session.avgReactionMs !== null ? session.avgReactionMs + 'ms' : '—' }}</p>
        </p-card>
        <p-card>
          <p style="color:var(--app-muted);font-size:0.8rem">BEST REACTION</p>
          <p style="font-size:1.5rem;font-weight:600">{{ session.bestReactionMs !== null ? session.bestReactionMs + 'ms' : '—' }}</p>
        </p-card>
        <p-card>
          <p style="color:var(--app-muted);font-size:0.8rem">SCORE</p>
          <p style="font-size:1.5rem;font-weight:600">{{ session.score ?? '—' }}</p>
        </p-card>
      </div>
      <div style="display:block;margin-bottom:1.5rem">
        <p-card header="Events">
        <p-table [value]="store.selectedSessionEvents()" stripedRows [paginator]="true" [rows]="50">
          <ng-template #header>
            <tr><th>#</th><th>Type</th><th>Elapsed</th><th>Reaction</th><th>Correct</th></tr>
          </ng-template>
          <ng-template #body let-event>
            <tr>
              <td>{{ event.eventIndex }}</td>
              <td>{{ event.eventType }}</td>
              <td>{{ event.elapsedMs !== null ? event.elapsedMs + 'ms' : '—' }}</td>
              <td>{{ event.reactionTimeMs !== null ? event.reactionTimeMs + 'ms' : '—' }}</td>
              <td>
                @if (event.isCorrect !== null) {
                  <p-tag [value]="event.isCorrect ? 'Hit' : 'Miss'" [severity]="event.isCorrect ? 'success' : 'danger'" />
                } @else { — }
              </td>
            </tr>
          </ng-template>
        </p-table>
        </p-card>
      </div>
      <p-dialog [(visible)]="showAssign" header="Assign Session" [modal]="true" [style]="{width:'440px'}">
        <div class="field">
          <label>Assign to User ID</label>
          <input pInputText [(ngModel)]="assignUserId" style="width:100%" placeholder="User UUID" />
        </div>
        <ng-template #footer>
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showAssign = false" />
          <p-button label="Assign" (onClick)="assign(session.id)" />
        </ng-template>
      </p-dialog>
    }
  `
})
export class SessionDetailComponent implements OnInit {
  protected readonly store = inject(SessionsStore);
  protected readonly orgStore = inject(OrganizationsStore);
  private readonly route = inject(ActivatedRoute);
  protected showAssign = false;
  protected assignUserId = '';
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.store.selectSession(id);
  }
  statusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' {
    if (status === 'COMPLETED') return 'success';
    if (status === 'FAILED') return 'danger';
    if (status === 'CANCELLED') return 'warn';
    return 'secondary';
  }
  async assign(sessionId: string): Promise<void> {
    await this.store.assignSession(sessionId, { assignedToUserId: this.assignUserId || undefined });
    this.showAssign = false;
    this.assignUserId = '';
  }
}
