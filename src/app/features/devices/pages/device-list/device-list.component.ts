import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { DevicesStore } from '../../devices.store';
import { DatePipe } from '@angular/common';
import { OrganizationsStore } from '../../../organizations/organizations.store';
@Component({
  selector: 'app-device-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule, InputNumberModule, TagModule, MessageModule, FormsModule, RouterLink, DatePipe],
  template: `
    <div class="page-header">
      <h2>Device Kits</h2>
      @if (orgStore.canManageDevices()) {
        <p-button label="New Kit" icon="pi pi-plus" (onClick)="showCreate = true" />
      }
    </div>
    @if (store.error(); as err) {
      <div style="margin-bottom:1rem">
        <p-message severity="error" [text]="err.message" styleClass="w-full" />
      </div>
    }
    <p-table [value]="store.kits()" [loading]="store.loading()" stripedRows>
      <ng-template #header>
        <tr><th>Name</th><th>Code</th><th>Max Pods</th><th>Hub</th><th>Created</th><th>Actions</th></tr>
      </ng-template>
      <ng-template #body let-kit>
        <tr>
          <td>{{ kit.name }}</td>
          <td><code>{{ kit.code }}</code></td>
          <td>{{ kit.maxPods }}</td>
          <td>—</td>
          <td>{{ kit.createdAt | date:'short' }}</td>
          <td><p-button label="Details" size="small" [outlined]="true" [routerLink]="['/devices', kit.id]" /></td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr><td colspan="6" style="text-align:center">No device kits found.</td></tr>
      </ng-template>
    </p-table>
    @if (orgStore.canManageDevices()) {
      <p-dialog [(visible)]="showCreate" header="Create Device Kit" [modal]="true" [style]="{width:'440px'}">
        <div class="field">
          <label>Name *</label>
          <input pInputText [(ngModel)]="createName" style="width:100%" maxlength="150" />
        </div>
        <div class="field">
          <label>Code *</label>
          <input pInputText [(ngModel)]="createCode" style="width:100%" maxlength="100" placeholder="kit-001" />
        </div>
        <div class="field">
          <label>Description</label>
          <input pInputText [(ngModel)]="createDesc" style="width:100%" />
        </div>
        <div class="field">
          <label>Max Pods</label>
          <p-inputNumber [(ngModel)]="createMaxPods" [min]="1" [max]="200" style="width:100%" />
        </div>
        <ng-template #footer>
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showCreate = false" />
          <p-button label="Create" [loading]="store.loading()" (onClick)="create()" />
        </ng-template>
      </p-dialog>
    }
  `
})
export class DeviceListComponent implements OnInit {
  protected readonly store = inject(DevicesStore);
  protected readonly orgStore = inject(OrganizationsStore);
  protected showCreate = false;
  protected createName = '';
  protected createCode = '';
  protected createDesc = '';
  protected createMaxPods = 20;
  ngOnInit(): void { this.store.loadKits(); }
  async create(): Promise<void> {
    if (!this.createName || !this.createCode) return;
    const orgId = this.orgStore.selectedOrganizationId();
    if (!orgId) return;
    try {
      await this.store.createKit({ organizationId: orgId, name: this.createName, code: this.createCode, description: this.createDesc || undefined, maxPods: this.createMaxPods });
      this.showCreate = false;
      this.createName = ''; this.createCode = ''; this.createDesc = ''; this.createMaxPods = 20;
    } catch { /* error shown in store */ }
  }
}
