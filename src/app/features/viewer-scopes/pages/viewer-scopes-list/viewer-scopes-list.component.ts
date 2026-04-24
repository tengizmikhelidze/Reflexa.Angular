import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ViewerScopesStore } from '../../viewer-scopes.store';
import { OrganizationsStore } from '../../../organizations/organizations.store';
import { ViewerScopeSummary } from '../../../../core/models/viewer-scope.models';
@Component({
  selector: 'app-viewer-scopes-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule, MessageModule, FormsModule, ConfirmDialogModule, DatePipe],
  providers: [ConfirmationService],
  template: `
    <div class="page-header">
      <h2>Viewer Scopes</h2>
      @if (orgStore.canManageViewerScopes()) {
        <p-button label="Grant Access" icon="pi pi-plus" (onClick)="showCreate = true" />
      }
    </div>
    @if (store.error(); as err) {
      <div style="margin-bottom:1rem">
        <p-message severity="error" [text]="err.message" styleClass="w-full" />
      </div>
    }
    <p-table [value]="store.scopes()" [loading]="store.loading()" stripedRows>
      <ng-template #header>
        <tr><th>Viewer User ID</th><th>Target User ID</th><th>Granted</th><th>Actions</th></tr>
      </ng-template>
      <ng-template #body let-scope>
        <tr>
          <td>{{ scope.viewerUserId }}</td>
          <td>{{ scope.targetUserId }}</td>
          <td>{{ scope.createdAt | date:'short' }}</td>
          <td>
            @if (orgStore.canManageViewerScopes()) {
              <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="confirmRevoke(scope)" />
            }
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr><td colspan="4" style="text-align:center">No viewer scopes configured.</td></tr>
      </ng-template>
    </p-table>
    @if (orgStore.canManageViewerScopes()) {
      <p-dialog [(visible)]="showCreate" header="Grant Viewer Access" [modal]="true" [style]="{width:'440px'}">
        <div class="field"><label>Viewer User ID *</label><input pInputText [(ngModel)]="viewerUserId" style="width:100%" placeholder="UUID" /></div>
        <div class="field"><label>Target User ID *</label><input pInputText [(ngModel)]="targetUserId" style="width:100%" placeholder="UUID" /></div>
        <ng-template #footer>
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showCreate = false" />
          <p-button label="Grant" (onClick)="grant()" />
        </ng-template>
      </p-dialog>
    }
    <p-confirmDialog />
  `
})
export class ViewerScopesListComponent implements OnInit {
  protected readonly store = inject(ViewerScopesStore);
  protected readonly orgStore = inject(OrganizationsStore);
  private readonly confirmSvc = inject(ConfirmationService);
  protected showCreate = false;
  protected viewerUserId = '';
  protected targetUserId = '';
  ngOnInit(): void {
    const orgId = this.orgStore.selectedOrganizationId();
    if (orgId) this.store.loadScopes(orgId);
  }
  async grant(): Promise<void> {
    if (!this.viewerUserId || !this.targetUserId) return;
    const orgId = this.orgStore.selectedOrganizationId();
    if (!orgId) return;
    await this.store.createScope({ organizationId: orgId, viewerUserId: this.viewerUserId, targetUserId: this.targetUserId });
    this.showCreate = false; this.viewerUserId = ''; this.targetUserId = '';
  }
  confirmRevoke(scope: ViewerScopeSummary): void {
    this.confirmSvc.confirm({
      message: 'Revoke this viewer access?',
      header: 'Confirm Revoke',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.store.deleteScope(scope.id)
    });
  }
}
