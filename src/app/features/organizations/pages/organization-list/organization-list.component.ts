import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { OrganizationsStore } from '../../organizations.store';
@Component({
  selector: 'app-organization-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule, TagModule, MessageModule, FormsModule, RouterLink, DatePipe],
  template: `
    <div class="page-header">
      <h2>Organizations</h2>
      <p-button label="New Organization" icon="pi pi-plus" (onClick)="showCreate = true" />
    </div>
    @if (store.error(); as err) {
      <div style="margin-bottom:1rem">
        <p-message severity="error" [text]="err.message" styleClass="w-full" />
      </div>
    }
    <p-table [value]="store.organizations()" [loading]="store.loading()" stripedRows>
      <ng-template #header>
        <tr>
          <th>Name</th><th>Slug</th><th>Status</th><th>Created</th><th>Actions</th>
        </tr>
      </ng-template>
      <ng-template #body let-org>
        <tr>
          <td>{{ org.name }}</td>
          <td><code>{{ org.slug }}</code></td>
          <td><p-tag [value]="org.isActive ? 'Active' : 'Inactive'" [severity]="org.isActive ? 'success' : 'danger'" /></td>
          <td>{{ org.createdAt | date:'short' }}</td>
          <td>
            <p-button label="Select" size="small" [outlined]="true" (onClick)="select(org.id)" />
            <p-button label="Members" size="small" severity="secondary" [outlined]="true" [routerLink]="['/organizations', org.id, 'members']" />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr><td colspan="5" style="text-align:center">No organizations found. Create one to get started.</td></tr>
      </ng-template>
    </p-table>
    <p-dialog [(visible)]="showCreate" header="Create Organization" [modal]="true" [style]="{width:'440px'}">
      <div class="field">
        <label>Name *</label>
        <input pInputText [(ngModel)]="createName" style="width:100%" maxlength="200" />
      </div>
      <div class="field">
        <label>Slug *</label>
        <input pInputText [(ngModel)]="createSlug" style="width:100%" maxlength="150" placeholder="my-org" />
        <span style="font-size:0.75rem;color:var(--p-surface-500)">Lowercase letters, numbers, hyphens only</span>
      </div>
      <div class="field">
        <label>Description</label>
        <input pInputText [(ngModel)]="createDesc" style="width:100%" maxlength="1000" />
      </div>
      <ng-template #footer>
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showCreate = false" />
        <p-button label="Create" [loading]="store.loading()" (onClick)="create()" />
      </ng-template>
    </p-dialog>
  `
})
export class OrganizationListComponent implements OnInit {
  protected readonly store = inject(OrganizationsStore);
  protected showCreate = false;
  protected createName = '';
  protected createSlug = '';
  protected createDesc = '';
  ngOnInit(): void { this.store.loadOrganizations(); }
  select(id: string): void { this.store.selectOrganization(id); }
  async create(): Promise<void> {
    if (!this.createName || !this.createSlug) return;
    try {
      await this.store.createOrganization({ name: this.createName, slug: this.createSlug, description: this.createDesc || undefined });
      this.showCreate = false;
      this.createName = ''; this.createSlug = ''; this.createDesc = '';
    } catch { /* error shown in store */ }
  }
}
