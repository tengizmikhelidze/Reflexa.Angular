import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import type { RegisterHubRequest } from '../data-access/devices.types';

@Component({
  selector: 'app-hub-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, InputTextModule, FormsModule],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      header="Register Hub"
      [modal]="true"
      [style]="{ width: '440px' }"
    >
      <div class="field" style="margin-bottom:1rem">
        <label for="hf-uid" style="display:block;margin-bottom:0.25rem">Hardware UID *</label>
        <input
          id="hf-uid"
          pInputText
          [ngModel]="hardwareUid()"
          (ngModelChange)="hardwareUid.set($event)"
          style="width:100%"
          maxlength="100"
        />
        @if (submitted() && hardwareUidError()) {
          <small style="color:var(--p-red-500)">{{ hardwareUidError() }}</small>
        }
      </div>

      <div class="field" style="margin-bottom:1rem">
        <label for="hf-serial" style="display:block;margin-bottom:0.25rem">Serial Number</label>
        <input
          id="hf-serial"
          pInputText
          [ngModel]="serialNumber()"
          (ngModelChange)="serialNumber.set($event)"
          style="width:100%"
        />
      </div>

      <div class="field" style="margin-bottom:1rem">
        <label for="hf-fw" style="display:block;margin-bottom:0.25rem">Firmware Version</label>
        <input
          id="hf-fw"
          pInputText
          [ngModel]="firmwareVersion()"
          (ngModelChange)="firmwareVersion.set($event)"
          style="width:100%"
        />
      </div>

      <div class="field" style="margin-bottom:1rem">
        <label for="hf-bt" style="display:block;margin-bottom:0.25rem">Bluetooth Name</label>
        <input
          id="hf-bt"
          pInputText
          [ngModel]="bluetoothName()"
          (ngModelChange)="bluetoothName.set($event)"
          style="width:100%"
        />
      </div>

      <ng-template #footer>
        <p-button
          label="Cancel"
          severity="secondary"
          [text]="true"
          (onClick)="visible.set(false)"
        />
        <p-button label="Register" [loading]="loading()" (onClick)="submit()" />
      </ng-template>
    </p-dialog>
  `,
})
export class HubFormComponent {
  readonly visible = model(false);
  readonly loading = input(false);

  readonly hubRegistered = output<RegisterHubRequest>();

  readonly hardwareUid = signal('');
  readonly serialNumber = signal('');
  readonly firmwareVersion = signal('');
  readonly bluetoothName = signal('');
  readonly submitted = signal(false);

  readonly hardwareUidError = computed(() => {
    const v = this.hardwareUid().trim();
    if (!v) return 'Hardware UID is required.';
    if (v.length > 100) return 'Hardware UID must be 100 characters or fewer.';
    return null;
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.hardwareUid.set('');
          this.serialNumber.set('');
          this.firmwareVersion.set('');
          this.bluetoothName.set('');
          this.submitted.set(false);
        });
      }
    });
  }

  submit(): void {
    this.submitted.set(true);
    if (this.hardwareUidError()) return;

    const serial = this.serialNumber().trim();
    const fw = this.firmwareVersion().trim();
    const bt = this.bluetoothName().trim();

    this.hubRegistered.emit({
      hardwareUid: this.hardwareUid().trim(),
      ...(serial ? { serialNumber: serial } : {}),
      ...(fw ? { firmwareVersion: fw } : {}),
      ...(bt ? { bluetoothName: bt } : {}),
    });
  }
}
