import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { DeviceKitFormComponent } from '../components/device-kit-form.component';
import { DevicesStore } from '../data-access/devices.store';
import type { CreateDeviceKitRequest } from '../data-access/devices.types';
import { OrganizationsStore } from '../../organizations/data-access/organizations.store';

@Component({
  selector: 'app-device-kits-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, MessageModule, RouterLink, DatePipe, DeviceKitFormComponent],
  template: `
    <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
      <h2 style="margin:0">Device Kits</h2>
      @if (store.canManageDevices()) {
        <p-button label="New Kit" icon="pi pi-plus" (onClick)="showCreateKit.set(true)" />
      }
    </div>

    @if (store.error(); as err) {
      <div style="margin-bottom:1rem">
        <p-message severity="error" [text]="err.message" styleClass="w-full" />
      </div>
    }

    <p-table [value]="store.kits()" [loading]="store.loading()" stripedRows>
      <ng-template #header>
        <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Description</th>
          <th>Max Pods</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </ng-template>
      <ng-template #body let-kit>
        <tr>
          <td>{{ kit.name }}</td>
          <td><code>{{ kit.code }}</code></td>
          <td>{{ kit.description ?? '—' }}</td>
          <td>{{ kit.maxPods }}</td>
          <td>{{ kit.createdAt | date: 'short' }}</td>
          <td>
            <p-button
              label="View"
              size="small"
              [outlined]="true"
              [routerLink]="'/devices/' + kit.id"
              (onClick)="store.selectKit(kit.id)"
            />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td colspan="6" style="text-align:center">No device kits found.</td>
        </tr>
      </ng-template>
    </p-table>

    <app-device-kit-form
      [visible]="showCreateKit()"
      (visibleChange)="showCreateKit.set($event)"
      [loading]="store.loading()"
      [organizationId]="orgStore.selectedOrganizationId()!"
      (kitCreated)="onKitCreated($event)"
    />
  `,
})
export class DeviceKitsPage implements OnInit {
  protected readonly store = inject(DevicesStore);
  protected readonly orgStore = inject(OrganizationsStore);

  protected readonly showCreateKit = signal(false);

  ngOnInit(): void {
    this.store.loadKits();
  }

  async onKitCreated(input: CreateDeviceKitRequest): Promise<void> {
    try {
      await this.store.createKit({
        ...input,
        organizationId: this.orgStore.selectedOrganizationId()!,
      });
      this.showCreateKit.set(false);
    } catch {
      // error surfaced via store.error()
    }
  }
}
