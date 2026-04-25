import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import type { PodSummary } from '../data-access/devices.types';

@Component({
  selector: 'app-pod-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, TagModule, ButtonModule],
  template: `
    <p-table [value]="pods()" stripedRows>
      <ng-template #header>
        <tr>
          <th>Hardware UID</th>
          <th>Serial #</th>
          <th>Firmware</th>
          <th>Battery</th>
          <th>Status</th>
          <th></th>
        </tr>
      </ng-template>
      <ng-template #body let-pod>
        <tr>
          <td>{{ pod.hardwareUid }}</td>
          <td>{{ pod.serialNumber ?? '—' }}</td>
          <td>{{ pod.firmwareVersion ?? '—' }}</td>
          <td>
            <p-tag
              [value]="pod.batteryPercent !== null ? pod.batteryPercent + '%' : 'N/A'"
              [severity]="batteryTagSeverity(pod.batteryLevel)"
            />
          </td>
          <td>
            <p-tag
              [value]="pod.isActive ? 'Active' : 'Inactive'"
              [severity]="pod.isActive ? 'success' : 'secondary'"
            />
          </td>
          <td>
            <p-button
              label="Reassign"
              size="small"
              [outlined]="true"
              (onClick)="reassignRequested.emit(pod)"
            />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td colspan="6" style="text-align:center">No pods registered.</td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class PodTableComponent {
  readonly pods = input<PodSummary[]>([]);
  readonly reassignRequested = output<PodSummary>();

  batteryTagSeverity(
    level: PodSummary['batteryLevel'],
  ): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (level) {
      case 'HIGH':
        return 'success';
      case 'MEDIUM':
        return 'warn';
      case 'LOW':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
