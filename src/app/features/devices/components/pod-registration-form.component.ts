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
import type { RegisterPodsRequest } from '../data-access/devices.types';

interface PodEntry {
  hardwareUid: string;
  serialNumber: string;
  firmwareVersion: string;
  logicalIndex: string;
}

function emptyEntry(): PodEntry {
  return { hardwareUid: '', serialNumber: '', firmwareVersion: '', logicalIndex: '' };
}

@Component({
  selector: 'app-pod-registration-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, InputTextModule, FormsModule],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      header="Register Pods"
      [modal]="true"
      [style]="{ width: '680px' }"
    >
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="text-align:left;padding:0.25rem 0.5rem;font-size:0.8rem">Hardware UID *</th>
              <th style="text-align:left;padding:0.25rem 0.5rem;font-size:0.8rem">Serial #</th>
              <th style="text-align:left;padding:0.25rem 0.5rem;font-size:0.8rem">Firmware</th>
              <th style="text-align:left;padding:0.25rem 0.5rem;font-size:0.8rem">Index</th>
              <th style="width:2.5rem"></th>
            </tr>
          </thead>
          <tbody>
            @for (entry of entries(); track $index) {
              <tr>
                <td style="padding:0.25rem 0.5rem">
                  <input
                    pInputText
                    [ngModel]="entry.hardwareUid"
                    (ngModelChange)="updateEntry($index, 'hardwareUid', $event)"
                    style="width:100%"
                    maxlength="100"
                  />
                </td>
                <td style="padding:0.25rem 0.5rem">
                  <input
                    pInputText
                    [ngModel]="entry.serialNumber"
                    (ngModelChange)="updateEntry($index, 'serialNumber', $event)"
                    style="width:100%"
                  />
                </td>
                <td style="padding:0.25rem 0.5rem">
                  <input
                    pInputText
                    [ngModel]="entry.firmwareVersion"
                    (ngModelChange)="updateEntry($index, 'firmwareVersion', $event)"
                    style="width:100%"
                  />
                </td>
                <td style="padding:0.25rem 0.5rem">
                  <input
                    pInputText
                    type="number"
                    min="0"
                    [ngModel]="entry.logicalIndex"
                    (ngModelChange)="updateEntry($index, 'logicalIndex', $event)"
                    style="width:5rem"
                  />
                </td>
                <td style="padding:0.25rem 0.25rem;text-align:center">
                  @if (entries().length > 1) {
                    <p-button
                      icon="pi pi-trash"
                      severity="danger"
                      [text]="true"
                      size="small"
                      (onClick)="removeEntry($index)"
                    />
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div style="margin-top:0.75rem">
        <p-button
          label="Add Pod"
          icon="pi pi-plus"
          severity="secondary"
          [text]="true"
          size="small"
          (onClick)="addEntry()"
        />
      </div>

      @if (submitted() && !formValid()) {
        <small style="color:var(--p-red-500);display:block;margin-top:0.5rem">
          All pods require a Hardware UID.
        </small>
      }

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
export class PodRegistrationFormComponent {
  readonly visible = model(false);
  readonly loading = input(false);

  readonly podsRegistered = output<RegisterPodsRequest>();

  readonly entries = signal<PodEntry[]>([emptyEntry()]);
  readonly submitted = signal(false);

  readonly formValid = computed(() =>
    this.entries().every((e) => e.hardwareUid.trim().length > 0),
  );

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.entries.set([emptyEntry()]);
          this.submitted.set(false);
        });
      }
    });
  }

  addEntry(): void {
    this.entries.update((list) => [...list, emptyEntry()]);
  }

  removeEntry(index: number): void {
    this.entries.update((list) => list.filter((_, i) => i !== index));
  }

  updateEntry(index: number, field: keyof PodEntry, value: string): void {
    this.entries.update((list) => {
      const updated = [...list];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.formValid()) return;

    this.podsRegistered.emit({
      pods: this.entries().map((e) => ({
        hardwareUid: e.hardwareUid.trim(),
        ...(e.serialNumber.trim() ? { serialNumber: e.serialNumber.trim() } : {}),
        ...(e.firmwareVersion.trim() ? { firmwareVersion: e.firmwareVersion.trim() } : {}),
        ...(e.logicalIndex.trim() ? { logicalIndex: parseInt(e.logicalIndex, 10) } : {}),
      })),
    });
  }
}
