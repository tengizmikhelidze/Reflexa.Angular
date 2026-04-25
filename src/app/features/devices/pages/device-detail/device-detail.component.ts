import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { DevicesStore } from '../../devices.store';
import { OrganizationsStore } from '../../../organizations/organizations.store';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
@Component({
  selector: 'app-device-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, TableModule, ButtonModule, DialogModule, InputTextModule, TagModule, MessageModule, FormsModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    @if (store.detailLoading()) {
      <p>Loading...</p>
    } @else if (store.selectedKit(); as kit) {
      <div class="page-header">
        <h2>{{ kit.name }}</h2>
        <code>{{ kit.code }}</code>
      </div>
      @if (store.error(); as err) {
        <div style="margin-bottom:1rem">
          <p-message severity="error" [text]="err.message" styleClass="w-full" />
        </div>
      }
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem">
        <p-card header="Hub">
          @if (store.selectedKitHub(); as hub) {
            <p><b>UID:</b> {{ hub.hardwareUid }}</p>
            <p><b>Serial:</b> {{ hub.serialNumber ?? '—' }}</p>
            <p><b>Firmware:</b> {{ hub.firmwareVersion ?? '—' }}</p>
            <p-tag [value]="hub.isActive ? 'Active' : 'Inactive'" [severity]="hub.isActive ? 'success' : 'danger'" />
          } @else {
            <p style="color:var(--app-muted)">No hub registered</p>
            @if (orgStore.canManageDevices()) {
              <p-button label="Register Hub" size="small" (onClick)="showRegisterHub = true" />
            }
          }
        </p-card>
        <p-card header="Pods">
          <p>{{ store.selectedKitPodCount() }} / {{ kit.maxPods }} pods</p>
          <p>Active: {{ store.activePods().length }}</p>
          @if (store.lowBatteryPods().length > 0) {
            <p-tag value="Low Battery Pods" severity="warn" />
          }
            @if (orgStore.canManageDevices()) {
              <div style="margin-top:0.5rem">
                <p-button label="Register Pods" size="small" (onClick)="showRegisterPods = true" />
              </div>
            }
        </p-card>
      </div>
      <p-card header="Pods">
        <p-table [value]="store.pods()" stripedRows>
          <ng-template #header>
            <tr><th>UID</th><th>Display</th><th>Index</th><th>Battery</th><th>Status</th></tr>
          </ng-template>
          <ng-template #body let-pod>
            <tr>
              <td>{{ pod.hardwareUid }}</td>
              <td>{{ pod.displayName ?? '—' }}</td>
              <td>{{ pod.logicalIndex ?? '—' }}</td>
              <td>
                @if (pod.batteryLevel) {
                  <p-tag [value]="pod.batteryLevel" [severity]="pod.batteryLevel === 'LOW' ? 'danger' : pod.batteryLevel === 'MEDIUM' ? 'warn' : 'success'" />
                } @else { — }
              </td>
              <td><p-tag [value]="pod.isActive ? 'Active' : 'Inactive'" [severity]="pod.isActive ? 'success' : 'secondary'" /></td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
      <!-- Register Hub Dialog -->
      <p-dialog [(visible)]="showRegisterHub" header="Register Hub" [modal]="true" [style]="{width:'440px'}">
        <div class="field"><label>Hardware UID *</label><input pInputText [(ngModel)]="hubUid" style="width:100%" /></div>
        <div class="field"><label>Serial Number</label><input pInputText [(ngModel)]="hubSerial" style="width:100%" /></div>
        <div class="field"><label>Firmware Version</label><input pInputText [(ngModel)]="hubFw" style="width:100%" /></div>
        <div class="field"><label>Bluetooth Name</label><input pInputText [(ngModel)]="hubBt" style="width:100%" /></div>
        <ng-template #footer>
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showRegisterHub = false" />
          <p-button label="Register" (onClick)="registerHub(kit.id)" />
        </ng-template>
      </p-dialog>
      <!-- Register Pods Dialog -->
      <p-dialog [(visible)]="showRegisterPods" header="Register Pods" [modal]="true" [style]="{width:'500px'}">
        <p style="font-size:0.875rem;color:var(--p-surface-600)">Enter one hardware UID per line</p>
        <textarea pInputText [(ngModel)]="podsUidInput" rows="6" style="width:100%;resize:vertical"></textarea>
        <ng-template #footer>
          <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showRegisterPods = false" />
          <p-button label="Register" (onClick)="registerPods(kit.id)" />
        </ng-template>
      </p-dialog>
    }
  `
})
export class DeviceDetailComponent implements OnInit {
  protected readonly store = inject(DevicesStore);
  protected readonly orgStore = inject(OrganizationsStore);
  private readonly route = inject(ActivatedRoute);
  protected showRegisterHub = false;
  protected showRegisterPods = false;
  protected hubUid = ''; protected hubSerial = ''; protected hubFw = ''; protected hubBt = '';
  protected podsUidInput = '';
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.store.selectKit(id); this.store.loadPods(id); }
  }
  async registerHub(kitId: string): Promise<void> {
    if (!this.hubUid) return;
    await this.store.registerHub(kitId, { hardwareUid: this.hubUid, serialNumber: this.hubSerial || undefined, firmwareVersion: this.hubFw || undefined, bluetoothName: this.hubBt || undefined });
    this.showRegisterHub = false;
    this.hubUid = ''; this.hubSerial = ''; this.hubFw = ''; this.hubBt = '';
  }
  async registerPods(kitId: string): Promise<void> {
    const uids = this.podsUidInput.split('\n').map(s => s.trim()).filter(Boolean);
    if (!uids.length) return;
    await this.store.registerPods(kitId, { pods: uids.map(uid => ({ hardwareUid: uid })) });
    this.showRegisterPods = false;
    this.podsUidInput = '';
  }
}
