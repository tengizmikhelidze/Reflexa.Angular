import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { OrganizationsStore } from '../../organizations.store';
import { MemberWithRoles } from '../../../../core/models/organization.models';
import { RoleCode } from '../../../../core/models/api.models';
@Component({
  selector: 'app-organization-members',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule, TagModule, MultiSelectModule, MessageModule, FormsModule, DatePipe],
  template: `
    <div class="page-header">
      <h2>Members — {{ store.selectedOrganization()?.name }}</h2>
      @if (store.canManageUsers()) {
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
        <tr><th>Email</th><th>Name</th><th>Status</th><th>Roles</th><th>Joined</th><th>Actions</th></tr>
      </ng-template>
      <ng-template #body let-member>
        <tr>
          <td>{{ member.email }}</td>
          <td>{{ member.firstName }} {{ member.lastName }}</td>
          <td><p-tag [value]="member.status" [severity]="member.status === 'ACTIVE' ? 'success' : 'warn'" /></td>
          <td>
            @for (role of member.roles; track role) {
              <span style="margin-right:0.25rem"><p-tag [value]="role" severity="info" /></span>
            }
          </td>
          <td>{{ member.joinedAt | date:'short' }}</td>
          <td>
            @if (store.canManageUsers()) {
              <p-button icon="pi pi-pencil" size="small" [text]="true" (onClick)="editRoles(member)" />
            }
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr><td colspan="6" style="text-align:center">No members found.</td></tr>
      </ng-template>
    </p-table>
    <!-- Add Member Dialog -->
    @if (store.canManageUsers()) {
      <p-dialog [(visible)]="showAdd" header="Add Member" [modal]="true" [style]="{width:'440px'}">
        <div class="field">
          <label>Email *</label>
          <input pInputText [(ngModel)]="addEmail" type="email" style="width:100%" />
        </div>
        <ng-template #footer>
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showAdd = false" />
          <p-button label="Add" [loading]="store.membersLoading()" (onClick)="addMember()" />
        </ng-template>
      </p-dialog>
      <p-dialog [(visible)]="showRoleEdit" header="Edit Roles" [modal]="true" [style]="{width:'440px'}">
        @if (editingMember()) {
          <p>{{ editingMember()!.email }}</p>
          <div class="field">
            <label>Roles</label>
            <p-multiSelect [options]="roleOptions" [(ngModel)]="editingRoles" optionLabel="label" optionValue="value" style="width:100%" />
          </div>
        }
        <ng-template #footer>
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showRoleEdit = false" />
          <p-button label="Save Roles" (onClick)="saveRoles()" />
        </ng-template>
      </p-dialog>
    }
  `
})
export class OrganizationMembersComponent implements OnInit {
  protected readonly store = inject(OrganizationsStore);
  private readonly route = inject(ActivatedRoute);
  protected showAdd = false;
  protected showRoleEdit = false;
  protected addEmail = '';
  protected editingMember = signal<MemberWithRoles | null>(null);
  protected editingRoles: RoleCode[] = [];
  protected readonly roleOptions = [
    { label: 'Org Admin', value: 'ORG_ADMIN' },
    { label: 'Trainer', value: 'TRAINER' },
    { label: 'Athlete', value: 'ATHLETE' },
    { label: 'Viewer', value: 'VIEWER' }
  ];
  ngOnInit(): void {
    const orgId = this.route.snapshot.paramMap.get('orgId');
    if (orgId) {
      this.store.selectOrganization(orgId).then(() => this.store.loadMembers());
    } else {
      this.store.loadMembers();
    }
  }
  editRoles(member: MemberWithRoles): void {
    this.editingMember.set(member);
    this.editingRoles = [...member.roles] as RoleCode[];
    this.showRoleEdit = true;
  }
  async addMember(): Promise<void> {
    if (!this.addEmail) return;
    try {
      await this.store.addMember({ email: this.addEmail });
      this.showAdd = false;
      this.addEmail = '';
    } catch { /* error shown in store */ }
  }
  async saveRoles(): Promise<void> {
    const m = this.editingMember();
    if (!m) return;
    try {
      await this.store.replaceMemberRoles(m.membershipId, this.editingRoles);
      this.showRoleEdit = false;
    } catch { /* error shown in store */ }
  }
}
