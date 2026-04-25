import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { OrganizationsStore } from '../data-access/organizations.store';

const SLUG_PATTERN = /^[a-z0-9-]+$/;

@Component({
  selector: 'app-organizations-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    MessageModule,
    FormsModule,
    RouterLink,
    DatePipe,
  ],
  template: `
    <div class="page-header">
      <h2>Organizations</h2>
      <p-button label="New Organization" icon="pi pi-plus" (onClick)="openCreate()" />
    </div>

    @if (store.error()) {
      <p-message severity="error" [text]="store.error()!.message" styleClass="mb-4" />
    }

    <p-table [value]="store.organizations()" [loading]="store.loading()">
      <ng-template pTemplate="header">
        <tr>
          <th>Name</th>
          <th>Slug</th>
          <th>Status</th>
          <th>Created</th>
          <th></th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-org>
        <tr>
          <td>{{ org.name }}</td>
          <td>{{ org.slug }}</td>
          <td>
            <p-tag [value]="org.isActive ? 'Active' : 'Inactive'"
                   [severity]="org.isActive ? 'success' : 'danger'" />
          </td>
          <td>{{ org.createdAt | date: 'mediumDate' }}</td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <p-button
                label="Select"
                size="small"
                severity="secondary"
                (onClick)="select(org.id)"
              />
              <p-button
                label="Members"
                size="small"
                [text]="true"
                [routerLink]="['/organizations/members']"
                (onClick)="select(org.id)"
              />
            </div>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="5" style="text-align: center;">No organizations found.</td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog
      [(visible)]="showCreate"
      header="New Organization"
      [modal]="true"
      [style]="{ width: '480px' }"
      [draggable]="false"
      (onHide)="closeCreate()"
    >
      <div style="display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0;">
        <div>
          <label for="orgName">Name *</label>
          <input
            pInputText
            id="orgName"
            [ngModel]="createName()"
            (ngModelChange)="createName.set($event)"
            placeholder="My Organization"
            style="width: 100%;"
          />
          @if (nameError()) {
            <small style="color: var(--p-red-500);">{{ nameError() }}</small>
          }
        </div>
        <div>
          <label for="orgSlug">Slug *</label>
          <input
            pInputText
            id="orgSlug"
            [ngModel]="createSlug()"
            (ngModelChange)="createSlug.set($event)"
            placeholder="my-organization"
            style="width: 100%;"
          />
          @if (slugError()) {
            <small style="color: var(--p-red-500);">{{ slugError() }}</small>
          }
        </div>
        <div>
          <label for="orgDesc">Description</label>
          <input
            pInputText
            id="orgDesc"
            [ngModel]="createDesc()"
            (ngModelChange)="createDesc.set($event)"
            placeholder="Optional description"
            style="width: 100%;"
          />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="closeCreate()" />
        <p-button
          label="Create"
          [loading]="store.loading()"
          [disabled]="!createFormValid()"
          (onClick)="create()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }
      .page-header h2 {
        margin: 0;
      }
    `,
  ],
})
export class OrganizationsPage implements OnInit {
  protected readonly store = inject(OrganizationsStore);

  protected readonly createName = signal('');
  protected readonly createSlug = signal('');
  protected readonly createDesc = signal('');
  protected readonly submitted = signal(false);
  protected showCreate = false;

  protected readonly nameError = computed(() => {
    if (!this.submitted()) return null;
    if (!this.createName().trim()) return 'Name is required.';
    return null;
  });

  protected readonly slugError = computed(() => {
    if (!this.submitted()) return null;
    const slug = this.createSlug().trim();
    if (!slug) return 'Slug is required.';
    if (!SLUG_PATTERN.test(slug)) return 'Slug may only contain lowercase letters, numbers, and hyphens.';
    if (slug.length > 150) return 'Slug must be 150 characters or fewer.';
    return null;
  });

  protected readonly createFormValid = computed(() => {
    const name = this.createName().trim();
    const slug = this.createSlug().trim();
    return name.length > 0 && slug.length > 0 && SLUG_PATTERN.test(slug) && slug.length <= 150;
  });

  ngOnInit(): void {
    this.store.loadOrganizations();
  }

  protected openCreate(): void {
    this.showCreate = true;
    this.submitted.set(false);
  }

  protected closeCreate(): void {
    this.showCreate = false;
    this.createName.set('');
    this.createSlug.set('');
    this.createDesc.set('');
    this.submitted.set(false);
  }

  protected select(id: string): void {
    this.store.selectOrganization(id);
  }

  protected async create(): Promise<void> {
    this.submitted.set(true);
    if (!this.createFormValid()) return;
    const desc = this.createDesc().trim();
    await this.store.createOrganization({
      name: this.createName().trim(),
      slug: this.createSlug().trim(),
      ...(desc ? { description: desc } : {}),
    });
    if (!this.store.error()) {
      this.closeCreate();
    }
  }
}
