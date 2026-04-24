import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { PresetsStore } from '../../presets.store';
import { OrganizationsStore } from '../../../organizations/organizations.store';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PresetSummary } from '../../../../core/models/preset.models';
@Component({
  selector: 'app-preset-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TagModule, MessageModule, FormsModule, ConfirmDialogModule, DatePipe],
  providers: [ConfirmationService],
  template: `
    <div class="page-header">
      <h2>Presets</h2>
      <p-button label="New Preset" icon="pi pi-plus" (onClick)="showCreate = true" />
    </div>
    @if (store.error(); as err) {
      <div style="margin-bottom:1rem">
        <p-message severity="error" [text]="err.message" styleClass="w-full" />
      </div>
    }
    <p-table [value]="store.presets()" [loading]="store.loading()" stripedRows>
      <ng-template #header>
        <tr><th>Name</th><th>Scope</th><th>Description</th><th>Created</th><th>Actions</th></tr>
      </ng-template>
      <ng-template #body let-preset>
        <tr>
          <td>{{ preset.name }}</td>
          <td><p-tag [value]="preset.scope" [severity]="preset.scope === 'ORGANIZATION' ? 'info' : 'secondary'" /></td>
          <td>{{ preset.description ?? '—' }}</td>
          <td>{{ preset.createdAt | date:'short' }}</td>
          <td>
            <p-button icon="pi pi-pencil" size="small" [text]="true" (onClick)="editPreset(preset)" />
            <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="confirmDelete(preset)" />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr><td colspan="5" style="text-align:center">No presets found.</td></tr>
      </ng-template>
    </p-table>
    <p-dialog [(visible)]="showCreate" [header]="editingPreset() ? 'Edit Preset' : 'New Preset'" [modal]="true" [style]="{width:'500px'}">
      <div class="field">
        <label>Name *</label>
        <input pInputText [(ngModel)]="formName" style="width:100%" maxlength="150" />
      </div>
      <div class="field">
        <label>Scope</label>
        <p-select [options]="scopeOptions" [(ngModel)]="formScope" optionLabel="label" optionValue="value" style="width:100%" />
      </div>
      <div class="field">
        <label>Description</label>
        <input pInputText [(ngModel)]="formDescription" style="width:100%" maxlength="500" />
      </div>
      <div class="field">
        <label>Config JSON</label>
        <textarea pInputText [(ngModel)]="formConfigJson" rows="5" style="width:100%;resize:vertical;font-family:monospace"></textarea>
      </div>
      <ng-template #footer>
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="closeDialog()" />
        <p-button [label]="editingPreset() ? 'Save' : 'Create'" [loading]="store.loading()" (onClick)="save()" />
      </ng-template>
    </p-dialog>
    <p-confirmDialog />
  `
})
export class PresetListComponent implements OnInit {
  protected readonly store = inject(PresetsStore);
  protected readonly orgStore = inject(OrganizationsStore);
  private readonly confirmSvc = inject(ConfirmationService);
  protected showCreate = false;
  protected editingPreset = signal<PresetSummary | null>(null);
  protected formName = '';
  protected formScope: 'USER' | 'ORGANIZATION' = 'USER';
  protected formDescription = '';
  protected formConfigJson = '{}';
  protected readonly scopeOptions = [
    { label: 'Personal (User)', value: 'USER' },
    { label: 'Organization', value: 'ORGANIZATION' }
  ];
  ngOnInit(): void {
    const orgId = this.orgStore.selectedOrganizationId();
    if (orgId) this.store.updateFilters({ organizationId: orgId });
    this.store.loadPresets();
  }
  editPreset(preset: PresetSummary): void {
    this.editingPreset.set(preset);
    this.formName = preset.name;
    this.formScope = preset.scope;
    this.formDescription = preset.description ?? '';
    this.formConfigJson = '{}';
    this.showCreate = true;
  }
  closeDialog(): void {
    this.showCreate = false;
    this.editingPreset.set(null);
    this.formName = ''; this.formDescription = ''; this.formConfigJson = '{}';
  }
  async save(): Promise<void> {
    if (!this.formName) return;
    let configJson: Record<string, unknown>;
    try { configJson = JSON.parse(this.formConfigJson); } catch { return; }
    const editing = this.editingPreset();
    if (editing) {
      await this.store.updatePreset(editing.id, { name: this.formName, description: this.formDescription || undefined, configJson });
    } else {
      const orgId = this.orgStore.selectedOrganizationId();
      await this.store.createPreset({ scope: this.formScope, organizationId: this.formScope === 'ORGANIZATION' ? (orgId ?? undefined) : undefined, name: this.formName, description: this.formDescription || undefined, configJson });
    }
    this.closeDialog();
  }
  confirmDelete(preset: PresetSummary): void {
    this.confirmSvc.confirm({
      message: `Delete preset "${preset.name}"?`,
      header: 'Confirm Delete',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.store.deletePreset(preset.id)
    });
  }
}
