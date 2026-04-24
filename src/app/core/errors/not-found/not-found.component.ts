import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonModule],
  template: `
    <div style="text-align:center;padding:4rem">
      <i class="pi pi-exclamation-triangle" style="font-size:4rem;color:var(--p-orange-400)"></i>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist.</p>
      <p-button label="Go to Dashboard" routerLink="/dashboard" />
    </div>
  `
})
export class NotFoundComponent {}
