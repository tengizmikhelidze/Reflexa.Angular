import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { TeamsStore } from '../../teams.store';
import { OrganizationsStore } from '../../../organizations/organizations.store';
import { TeamSummary } from '../../../../core/models/team.models';
@Component({
  selector: 'app-team-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule, MessageModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h2>Teams</h2>
      @if (orgStore.canManageTeams()) {
        <p-button label="New Team" icon="pi pi-plus" (onClick)="showCreate = true" />
      }
    </div>
    @if (store.error(); as err) {
      <div style="margin-bottom:1rem">
        <p-message severity="error" [text]="err.message" styleClass="w-full" />
      </div>
    }
    <p-table [value]="store.teams()" [loading]="store.loading()" stripedRows>
      <ng-template #header>
        <tr><th>Name</th><th>Description</th><th>Members</th><th>Actions</th></tr>
      </ng-template>
      <ng-template #body let-team>
        <tr>
          <td>{{ team.name }}</td>
          <td>{{ team.description ?? '—' }}</td>
          <td>{{ team.memberCount ?? '—' }}</td>
          <td><p-button label="Details" size="small" [outlined]="true" [routerLink]="['/teams', team.id]" /></td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr><td colspan="4" style="text-align:center">No teams found.</td></tr>
      </ng-template>
    </p-table>
    @if (orgStore.canManageTeams()) {
      <p-dialog [(visible)]="showCreate" header="Create Team" [modal]="true" [style]="{width:'440px'}">
        <div class="field"><label>Name *</label><input pInputText [(ngModel)]="teamName" style="width:100%" maxlength="150" /></div>
        <div class="field"><label>Description</label><input pInputText [(ngModel)]="teamDesc" style="width:100%" maxlength="500" /></div>
        <ng-template #footer>
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showCreate = false" />
          <p-button label="Create" [loading]="store.loading()" (onClick)="create()" />
        </ng-template>
      </p-dialog>
    }
  `
})
export class TeamListComponent implements OnInit {
  protected readonly store = inject(TeamsStore);
  protected readonly orgStore = inject(OrganizationsStore);
  protected showCreate = false;
  protected teamName = '';
  protected teamDesc = '';
  ngOnInit(): void { this.store.loadTeams(this.orgStore.selectedOrganizationId() ?? undefined); }
  async create(): Promise<void> {
    if (!this.teamName) return;
    const orgId = this.orgStore.selectedOrganizationId();
    if (!orgId) return;
    try {
      await this.store.createTeam({ organizationId: orgId, name: this.teamName, description: this.teamDesc || undefined });
      this.showCreate = false; this.teamName = ''; this.teamDesc = '';
    } catch {}
  }
}
