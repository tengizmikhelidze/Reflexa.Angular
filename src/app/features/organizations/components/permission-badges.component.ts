import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-permission-badges',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TagModule],
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
      @for (role of roles(); track role) {
        <p-tag [value]="role" severity="info" />
      }
      @for (perm of permissions(); track perm) {
        <p-tag [value]="perm" severity="secondary" />
      }
    </div>
  `,
})
export class PermissionBadgesComponent {
  permissions = input<string[]>([]);
  roles = input<string[]>([]);
}
