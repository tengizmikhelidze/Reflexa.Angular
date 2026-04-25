import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { OrganizationsStore } from '../data-access/organizations.store';
import { MemberRoleEditorComponent } from '../components/member-role-editor.component';
import { PermissionBadgesComponent } from '../components/permission-badges.component';
import type { MemberWithRoles, RoleCode } from '../data-access/organizations.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-organization-members-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    MessageModule,
    FormsModule,
    DatePipe,
    MemberRoleEditorComponent,
    PermissionBadgesComponent,
  ],
  template: `
    <div class="page-header">
      <h2>Members — {{ store.selectedOrganization()?.name ?? '' }}</h2>
      @if (store.canManageUsers()) {
        <p-button label="Add Member" icon="pi pi-user-plus" (onClick)="openAdd()" />
      }
    </div>

    @if (store.error()) {
      <p-message severity="error" [text]="store.error()!.message" styleClass="mb-4" />
    }

    <p-table [value]="store.members()" [loading]="store.membersLoading()">
      <ng-template pTemplate="header">
        <tr>
          <th>Email</th>
          <th>Name</th>
          <th>Status</th>
          <th>Roles</th>
          <th>Joined</th>
          @if (store.canManageUsers()) {
            <th></th>
          }
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-member>
        <tr>
          <td>{{ member.email }}</td>
          <td>{{ member.displayName ?? (member.firstName + ' ' + member.lastName) }}</td>
          <td>
            <p-tag
              [value]="member.status"
              [severity]="member.status === 'active' ? 'success' : 'warn'"
            />
          </td>
          <td>
            <app-permission-badges [roles]="member.roles" />
          </td>
          <td>{{ member.joinedAt | date: 'mediumDate' }}</td>
          @if (store.canManageUsers()) {
            <td>
              <p-button
                icon="pi pi-pencil"
                size="small"
                [text]="true"
                (onClick)="openEditRoles(member)"
              />
            </td>
          }
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" style="text-align: center;">No members found.</td>
        </tr>
      </ng-template>
    </p-table>

    @if (store.canManageUsers()) {
      <p-dialog
        [visible]="showAddDialog()"
        (visibleChange)="showAddDialog.set($event)"
        header="Add Member"
        [modal]="true"
        [style]="{ width: '440px' }"
        [draggable]="false"
        (onHide)="closeAdd()"
      >
        <div style="display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0;">
          <div>
            <label for="memberEmail">Email *</label>
            <input
              pInputText
              id="memberEmail"
              [ngModel]="addEmail()"
              (ngModelChange)="addEmail.set($event)"
              placeholder="user@example.com"
              style="width: 100%;"
            />
            @if (addEmailError()) {
              <small style="color: var(--p-red-500);">{{ addEmailError() }}</small>
            }
          </div>
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="closeAdd()" />
          <p-button
            label="Add"
            [loading]="store.membersLoading()"
            [disabled]="!addFormValid()"
            (onClick)="addMember()"
          />
        </ng-template>
      </p-dialog>
    }

    <app-member-role-editor
      [visible]="showRoleEdit()"
      (visibleChange)="showRoleEdit.set($event)"
      [member]="editingMember()"
      [saving]="store.membersLoading()"
      (rolesChanged)="saveRoles($event)"
    />
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }
      .page-header h2 {
        margin: 0;
      }
    `,
  ],
})
export class OrganizationMembersPage implements OnInit {
  protected readonly store = inject(OrganizationsStore);

  protected readonly addEmail = signal('');
  protected readonly addSubmitted = signal(false);
  protected readonly showAddDialog = signal(false);

  protected readonly editingMember = signal<MemberWithRoles | null>(null);
  protected readonly showRoleEdit = signal(false);

  protected readonly addEmailError = computed(() => {
    if (!this.addSubmitted()) return null;
    const email = this.addEmail().trim();
    if (!email) return 'Email is required.';
    if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
    return null;
  });

  protected readonly addFormValid = computed(() => {
    const email = this.addEmail().trim();
    return email.length > 0 && EMAIL_PATTERN.test(email);
  });

  ngOnInit(): void {
    this.store.loadMembers();
  }

  protected openAdd(): void {
    this.showAddDialog.set(true);
    this.addSubmitted.set(false);
  }

  protected closeAdd(): void {
    this.showAddDialog.set(false);
    this.addEmail.set('');
    this.addSubmitted.set(false);
  }

  protected async addMember(): Promise<void> {
    this.addSubmitted.set(true);
    if (!this.addFormValid()) return;
    await this.store.addMember({ email: this.addEmail().trim().toLowerCase() });
    if (!this.store.error()) {
      this.closeAdd();
    }
  }

  protected openEditRoles(member: MemberWithRoles): void {
    this.editingMember.set(member);
    this.showRoleEdit.set(true);
  }

  protected async saveRoles(roleCodes: RoleCode[]): Promise<void> {
    const member = this.editingMember();
    if (!member) return;
    await this.store.replaceMemberRoles(member.membershipId, roleCodes);
    if (!this.store.error()) {
      this.showRoleEdit.set(false);
      this.editingMember.set(null);
    }
  }
}
