import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-forbidden',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonModule],
  template: `
    <div style="text-align:center;padding:4rem">
      <i class="pi pi-lock" style="font-size:4rem;color:var(--p-red-400)"></i>
      <h2>Access Forbidden</h2>
      <p>You don't have permission to access this page.</p>
      <p-button label="Go to Dashboard" routerLink="/dashboard" />
    </div>
  `
})
export class ForbiddenComponent {}
