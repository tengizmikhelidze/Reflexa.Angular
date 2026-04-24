import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { TeamsStore } from '../../teams.store';
import { OrganizationsStore } from '../../../organizations/organizations.store';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TeamMemberSummary } from '../../../../core/models/team.models';
@Component({
  selector: 'app-team-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, TableModule, ButtonModule, DialogModule, InputTextModule, MessageModule, FormsModule, ConfirmDialogModule, DatePipe],
  providers: [ConfirmationService],
  template: `
    @if (store.selectedTeam(); as team) {
      <div class="page-header">
        <h2>{{ team.name }}</h2>
        @if (orgStore.canManageTeams()) {
          <p-button label="Add Member" icon="pi pi-plus" (onClick)="showAdd = true" />
        }
      </div>
      @if (store.error(); as err) {
        <div style="margin-bottom:1rem">
          <p-message severity="error" [text]="err.message" styleClass="w-full" />
        </div>
      }
      <p-table [value]="store.members()" [loading]="store.membersLoading()" stripedRows>
        <ng-template #header>
          <tr><th>Email</th><th>Name</th><th>Joined</th><th>Actions</th></tr>
        </ng-template>
        <ng-template #body let-member>
          <tr>
            <td>{{ member.email }}</td>
            <td>{{ member.firstName }} {{ member.lastName }}</td>
            <td>{{ member.joinedAt | date:'short' }}</td>
            <td>
              @if (orgStore.canManageTeams()) {
                <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="confirmRemove(member, team.id)" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="4" style="text-align:center">No members.</td></tr>
        </ng-template>
      </p-table>
      <p-dialog [(visible)]="showAdd" header="Add Team Member" [modal]="true" [style]="{width:'440px'}">
        <div class="field"><label>User ID *</label><input pInputText [(ngModel)]="addUserId" style="width:100%" placeholder="UUID" /></div>
        <ng-template #footer>
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showAdd = false" />
          <p-button label="Add" (onClick)="addMember(team.id)" />
        </ng-template>
      </p-dialog>
      <p-confirmDialog />
    }
  `
})
export class TeamDetailComponent implements OnInit {
  protected readonly store = inject(TeamsStore);
  protected readonly orgStore = inject(OrganizationsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmSvc = inject(ConfirmationService);
  protected showAdd = false;
  protected addUserId = '';
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.store.selectTeam(id); this.store.loadMembers(id); }
  }
  async addMember(teamId: string): Promise<void> {
    if (!this.addUserId) return;
    await this.store.addMember(teamId, this.addUserId);
    this.showAdd = false; this.addUserId = '';
  }
  confirmRemove(member: TeamMemberSummary, teamId: string): void {
    this.confirmSvc.confirm({
      message: `Remove ${member.email} from team?`,
      header: 'Confirm Remove',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.store.removeMember(teamId, member.userId)
    });
  }
}
