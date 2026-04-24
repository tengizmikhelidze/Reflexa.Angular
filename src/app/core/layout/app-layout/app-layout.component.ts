import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastModule, ConfirmDialogModule],
  template: `
    <div class="reflexa-app-layout">
      <aside class="reflexa-sidebar">
        <app-sidebar />
      </aside>
      <div class="reflexa-main">
        <header class="reflexa-topbar">
          <app-topbar />
        </header>
        <main class="reflexa-content">
          <router-outlet />
        </main>
      </div>
    </div>
    <p-toast />
    <p-confirmDialog />
  `
})
export class AppLayoutComponent {}
