import {
  ChangeDetectionStrategy,
  Component,
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
import { MultiSelectModule } from 'primeng/multiselect';
import type { MemberWithRoles, RoleCode } from '../data-access/organizations.types';

interface RoleOption {
  label: string;
  value: RoleCode;
}

@Component({
  selector: 'app-member-role-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, MultiSelectModule, FormsModule],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      [header]="'Edit Roles' + (member() ? ' — ' + member()!.email : '')"
      [modal]="true"
      [style]="{ width: '480px' }"
      [draggable]="false"
    >
      <div style="display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0;">
        <p-multiSelect
          [options]="roleOptions"
          [ngModel]="selectedRoles()"
          (ngModelChange)="selectedRoles.set($event)"
          optionLabel="label"
          optionValue="value"
          placeholder="Select roles"
          [style]="{ width: '100%' }"
        />
        @if (selectedRoles().length === 0) {
          <small style="color: var(--p-red-500);">At least one role is required.</small>
        }
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="visible.set(false)" />
        <p-button
          label="Save"
          [loading]="saving()"
          [disabled]="selectedRoles().length === 0"
          (onClick)="onSave()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class MemberRoleEditorComponent {
  visible = model(false);
  member = input<MemberWithRoles | null>(null);
  saving = input(false);
  rolesChanged = output<RoleCode[]>();

  protected readonly selectedRoles = signal<RoleCode[]>([]);

  protected readonly roleOptions: RoleOption[] = [
    { label: 'Org Admin', value: 'ORG_ADMIN' },
    { label: 'Trainer', value: 'TRAINER' },
    { label: 'Athlete', value: 'ATHLETE' },
    { label: 'Viewer', value: 'VIEWER' },
  ];

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      const m = this.member();
      if (isVisible && m) {
        untracked(() => this.selectedRoles.set([...m.roles]));
      }
    });
  }

  protected onSave(): void {
    if (this.selectedRoles().length === 0) return;
    this.rolesChanged.emit(this.selectedRoles());
  }
}
