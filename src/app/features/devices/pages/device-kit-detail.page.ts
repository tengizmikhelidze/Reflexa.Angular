import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { HubFormComponent } from '../components/hub-form.component';
import { KitAccessTableComponent } from '../components/kit-access-table.component';
import { PodRegistrationFormComponent } from '../components/pod-registration-form.component';
import { PodTableComponent } from '../components/pod-table.component';
import { DevicesStore } from '../data-access/devices.store';
import type {
  PodSummary,
  RegisterHubRequest,
  RegisterPodsRequest,
} from '../data-access/devices.types';

@Component({
  selector: 'app-device-kit-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    RouterLink,
    DatePipe,
    FormsModule,
    CheckboxModule,
    HubFormComponent,
    PodRegistrationFormComponent,
    PodTableComponent,
    KitAccessTableComponent,
  ],
  template: `
    <!-- Header -->
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
      <p-button
        icon="pi pi-arrow-left"
        severity="secondary"
        [text]="true"
        routerLink="/devices"
      />
      @if (store.detailLoading()) {
        <span class="pi pi-spin pi-spinner" style="font-size:1.25rem"></span>
      } @else if (store.selectedKit(); as kit) {
        <h2 style="margin:0">{{ kit.name }}</h2>
        <code style="font-size:0.875rem;color:var(--app-muted)">{{ kit.code }}</code>
      }
    </div>

    @if (store.error(); as err) {
      <div style="margin-bottom:1rem">
        <p-message severity="error" [text]="err.message" styleClass="w-full" />
      </div>
    }

    @if (store.selectedKit(); as kit) {
      <!-- Kit Info -->
      <section style="margin-bottom:2rem">
        <h3 style="margin-top:0">Kit Info</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem">
          <div><strong>Name</strong><br />{{ kit.name }}</div>
          <div><strong>Code</strong><br /><code>{{ kit.code }}</code></div>
          <div><strong>Organization ID</strong><br /><code style="font-size:0.75rem">{{ kit.organizationId }}</code></div>
          <div><strong>Description</strong><br />{{ kit.description ?? '—' }}</div>
          <div><strong>Max Pods</strong><br />{{ kit.maxPods }}</div>
          <div><strong>Created</strong><br />{{ kit.createdAt | date: 'short' }}</div>
        </div>
      </section>

      <!-- Hub Section -->
      <section style="margin-bottom:2rem">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem">
          <h3 style="margin:0">Hub</h3>
          @if (store.canManageDevices()) {
            <p-button
              [label]="store.hasHub() ? 'Replace Hub' : 'Register Hub'"
              icon="pi pi-server"
              size="small"
              [outlined]="true"
              (onClick)="showHubForm.set(true)"
            />
          }
        </div>

        @if (store.hasHub() && store.selectedKitHub(); as hub) {
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:0.75rem">
            <div><strong>Hardware UID</strong><br /><code>{{ hub.hardwareUid }}</code></div>
            <div><strong>Serial #</strong><br />{{ hub.serialNumber ?? '—' }}</div>
            <div><strong>Firmware</strong><br />{{ hub.firmwareVersion ?? '—' }}</div>
            <div><strong>Bluetooth</strong><br />{{ hub.bluetoothName ?? '—' }}</div>
            <div>
              <strong>Status</strong><br />
              <span [style.color]="hub.isActive ? 'var(--p-green-500)' : 'var(--p-red-500)'">
                {{ hub.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div><strong>Last Seen</strong><br />{{ hub.lastSeenAt ? (hub.lastSeenAt | date: 'short') : '—' }}</div>
          </div>
        } @else {
          <p style="color:var(--app-muted)">No hub registered.</p>
        }
      </section>

      <!-- Pods Section -->
      <section style="margin-bottom:2rem">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem">
          <h3 style="margin:0">Pods ({{ store.selectedKitPodCount() }})</h3>
          @if (store.canManageDevices()) {
            <p-button
              label="Register Pods"
              icon="pi pi-plus"
              size="small"
              [outlined]="true"
              (onClick)="showPodForm.set(true)"
            />
          }
        </div>
        <app-pod-table
          [pods]="store.pods()"
          (reassignRequested)="onReassignRequested($event)"
        />
      </section>

      <!-- Access Grants Section -->
      <section style="margin-bottom:2rem">
        <h3 style="margin-top:0">Access Grants</h3>
        <app-kit-access-table [grants]="store.accessGrants()" />

        @if (store.canManageDevices()) {
          <div style="margin-top:1.25rem;padding:1rem;border:1px solid var(--app-border);border-radius:6px">
            <h4 style="margin-top:0;margin-bottom:0.75rem">Grant Access</h4>
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:flex-end">
              <div class="field" style="flex:1;min-width:220px">
                <label style="display:block;margin-bottom:0.25rem;font-size:0.875rem">User ID *</label>
                <input
                  pInputText
                  [ngModel]="grantUserId()"
                  (ngModelChange)="grantUserId.set($event)"
                  style="width:100%"
                  placeholder="UUID"
                />
                @if (grantSubmitted() && !grantUserId().trim()) {
                  <small style="color:var(--p-red-500)">User ID is required.</small>
                }
              </div>

              <div style="display:flex;gap:1rem;align-items:center;padding-bottom:0.25rem">
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.875rem">
                  <p-checkbox
                    [ngModel]="grantCanOperate()"
                    (ngModelChange)="grantCanOperate.set($event)"
                    [binary]="true"
                  />
                  Can Operate
                </label>
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.875rem">
                  <p-checkbox
                    [ngModel]="grantCanManage()"
                    (ngModelChange)="grantCanManage.set($event)"
                    [binary]="true"
                  />
                  Can Manage
                </label>
              </div>

              <p-button
                label="Grant"
                icon="pi pi-check"
                [loading]="store.loading()"
                (onClick)="grantAccess(kit.id)"
              />
            </div>
          </div>
        }
      </section>
    }

    <!-- Hub Form Dialog -->
    <app-hub-form
      [visible]="showHubForm()"
      (visibleChange)="showHubForm.set($event)"
      [loading]="store.detailLoading()"
      (hubRegistered)="onHubRegistered($event)"
    />

    <!-- Pod Registration Dialog -->
    <app-pod-registration-form
      [visible]="showPodForm()"
      (visibleChange)="showPodForm.set($event)"
      [loading]="store.loading()"
      (podsRegistered)="onPodsRegistered($event)"
    />

    <!-- Reassign Pod Dialog -->
    <p-dialog
      [visible]="reassigningPod() !== null"
      (visibleChange)="onReassignDialogClose($event)"
      header="Reassign Pod"
      [modal]="true"
      [style]="{ width: '440px' }"
    >
      @if (reassigningPod(); as pod) {
        <p style="margin-top:0;font-size:0.875rem">
          Reassigning pod <code>{{ pod.hardwareUid }}</code>
        </p>
        <div class="field">
          <label style="display:block;margin-bottom:0.25rem">Target Kit ID *</label>
          <input
            pInputText
            [ngModel]="reassignTargetKitId()"
            (ngModelChange)="reassignTargetKitId.set($event)"
            style="width:100%"
            placeholder="UUID of target device kit"
          />
        </div>
        <ng-template #footer>
          <p-button
            label="Cancel"
            severity="secondary"
            [text]="true"
            (onClick)="reassigningPod.set(null)"
          />
          <p-button
            label="Reassign"
            [loading]="store.loading()"
            (onClick)="confirmReassign(pod.id)"
          />
        </ng-template>
      }
    </p-dialog>
  `,
})
export class DeviceKitDetailPage implements OnInit {
  protected readonly store = inject(DevicesStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly showHubForm = signal(false);
  protected readonly showPodForm = signal(false);

  protected readonly grantUserId = signal('');
  protected readonly grantCanOperate = signal(true);
  protected readonly grantCanManage = signal(false);
  protected readonly grantSubmitted = signal(false);

  protected readonly reassigningPod = signal<PodSummary | null>(null);
  protected readonly reassignTargetKitId = signal('');

  private kitId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('kitId');
    if (!id) return;
    this.kitId = id;
    this.store.selectKit(id);
    this.store.loadPods(id);
    this.store.loadAccessGrants(id);
  }

  async onHubRegistered(input: RegisterHubRequest): Promise<void> {
    try {
      await this.store.registerHub(this.kitId, input);
      this.showHubForm.set(false);
    } catch {
      // error surfaced via store.error()
    }
  }

  async onPodsRegistered(input: RegisterPodsRequest): Promise<void> {
    try {
      await this.store.registerPods(this.kitId, input);
      this.showPodForm.set(false);
    } catch {
      // error surfaced via store.error()
    }
  }

  onReassignRequested(pod: PodSummary): void {
    this.reassignTargetKitId.set('');
    this.reassigningPod.set(pod);
  }

  onReassignDialogClose(visible: boolean): void {
    if (!visible) this.reassigningPod.set(null);
  }

  async confirmReassign(podId: string): Promise<void> {
    const targetId = this.reassignTargetKitId().trim();
    if (!targetId) return;
    try {
      await this.store.reassignPod(podId, { targetDeviceKitId: targetId });
      this.reassigningPod.set(null);
    } catch {
      // error surfaced via store.error()
    }
  }

  async grantAccess(kitId: string): Promise<void> {
    this.grantSubmitted.set(true);
    const userId = this.grantUserId().trim();
    if (!userId) return;
    try {
      await this.store.grantAccess(kitId, {
        userId,
        canOperate: this.grantCanOperate(),
        canManage: this.grantCanManage(),
      });
      this.grantUserId.set('');
      this.grantCanOperate.set(true);
      this.grantCanManage.set(false);
      this.grantSubmitted.set(false);
    } catch {
      // error surfaced via store.error()
    }
  }
}
