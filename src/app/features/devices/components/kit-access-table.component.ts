import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import type { KitAccessGrant } from '../data-access/devices.types';

@Component({
  selector: 'app-kit-access-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, TagModule, DatePipe],
  template: `
    <p-table [value]="grants()" stripedRows>
      <ng-template #header>
        <tr>
          <th>User ID</th>
          <th>Can Operate</th>
          <th>Can Manage</th>
          <th>Granted By</th>
          <th>Granted At</th>
        </tr>
      </ng-template>
      <ng-template #body let-grant>
        <tr>
          <td>
            <code style="font-size:0.8rem">{{ grant.userId }}</code>
          </td>
          <td>
            <p-tag
              [value]="grant.canOperate ? 'Yes' : 'No'"
              [severity]="grant.canOperate ? 'success' : 'secondary'"
            />
          </td>
          <td>
            <p-tag
              [value]="grant.canManage ? 'Yes' : 'No'"
              [severity]="grant.canManage ? 'success' : 'secondary'"
            />
          </td>
          <td>
            <code style="font-size:0.8rem">{{ grant.grantedByUserId ?? '—' }}</code>
          </td>
          <td>{{ grant.createdAt | date: 'short' }}</td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td colspan="5" style="text-align:center">No access grants.</td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class KitAccessTableComponent {
  readonly grants = input<KitAccessGrant[]>([]);
}
