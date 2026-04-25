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
import type { CreateDeviceKitRequest } from '../data-access/devices.types';

@Component({
  selector: 'app-device-kit-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, InputTextModule, FormsModule],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      header="Create Device Kit"
      [modal]="true"
      [style]="{ width: '440px' }"
    >
      <div class="field" style="margin-bottom:1rem">
        <label for="dkf-name" style="display:block;margin-bottom:0.25rem">Name *</label>
        <input
          id="dkf-name"
          pInputText
          [ngModel]="name()"
          (ngModelChange)="name.set($event)"
          style="width:100%"
          maxlength="150"
        />
        @if (submitted() && nameError()) {
          <small style="color:var(--p-red-500)">{{ nameError() }}</small>
        }
      </div>

      <div class="field" style="margin-bottom:1rem">
        <label for="dkf-code" style="display:block;margin-bottom:0.25rem">Code *</label>
        <input
          id="dkf-code"
          pInputText
          [ngModel]="code()"
          (ngModelChange)="code.set($event)"
          style="width:100%"
          maxlength="100"
          placeholder="kit-001"
        />
        @if (submitted() && codeError()) {
          <small style="color:var(--p-red-500)">{{ codeError() }}</small>
        }
      </div>

      <div class="field" style="margin-bottom:1rem">
        <label for="dkf-desc" style="display:block;margin-bottom:0.25rem">Description</label>
        <input
          id="dkf-desc"
          pInputText
          [ngModel]="description()"
          (ngModelChange)="description.set($event)"
          style="width:100%"
        />
      </div>

      <div class="field" style="margin-bottom:1rem">
        <label for="dkf-maxpods" style="display:block;margin-bottom:0.25rem">Max Pods</label>
        <input
          id="dkf-maxpods"
          pInputText
          type="number"
          min="1"
          max="200"
          [ngModel]="maxPods()"
          (ngModelChange)="maxPods.set(+$event)"
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
        <p-button label="Create" [loading]="loading()" (onClick)="submit()" />
      </ng-template>
    </p-dialog>
  `,
})
export class DeviceKitFormComponent {
  readonly visible = model(false);
  readonly loading = input(false);
  readonly organizationId = input.required<string>();

  readonly kitCreated = output<CreateDeviceKitRequest>();

  readonly name = signal('');
  readonly code = signal('');
  readonly description = signal('');
  readonly maxPods = signal(20);
  readonly submitted = signal(false);

  readonly nameError = computed(() => {
    const v = this.name().trim();
    if (!v) return 'Name is required.';
    if (v.length > 150) return 'Name must be 150 characters or fewer.';
    return null;
  });

  readonly codeError = computed(() => {
    const v = this.code().trim();
    if (!v) return 'Code is required.';
    if (v.length > 100) return 'Code must be 100 characters or fewer.';
    if (!/^[a-z0-9-]+$/.test(v)) return 'Code may only contain lowercase letters, digits, and hyphens.';
    return null;
  });

  readonly formValid = computed(() => !this.nameError() && !this.codeError());

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.name.set('');
          this.code.set('');
          this.description.set('');
          this.maxPods.set(20);
          this.submitted.set(false);
        });
      }
    });
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.formValid()) return;

    const desc = this.description().trim();
    this.kitCreated.emit({
      organizationId: this.organizationId(),
      name: this.name().trim(),
      code: this.code().trim(),
      ...(desc ? { description: desc } : {}),
      maxPods: this.maxPods(),
    });
  }
}
