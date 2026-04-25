import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AuthStore } from '../../../features/auth/data-access/auth.store';
import { OrganizationSwitcherComponent } from '../../../features/organizations/components/organization-switcher.component';
import { ThemeStore } from '../../theme/theme.store';
import { ThemeSettingsComponent } from '../../../shared/components/theme-settings/theme-settings.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrganizationSwitcherComponent, ButtonModule, DialogModule, ThemeSettingsComponent],
  template: `
    <div class="topbar-left">
      <app-organization-switcher />
    </div>
    <div class="topbar-right">
      <p-button
        [icon]="themeStore.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
        [rounded]="true"
        [text]="true"
        severity="secondary"
        (onClick)="showThemePanel = true"
      />
      <span class="user-name">{{ authStore.displayName() }}</span>
    </div>

    <p-dialog
      [(visible)]="showThemePanel"
      header="Theme Settings"
      [modal]="true"
      [style]="{ width: '380px' }"
      [draggable]="false"
    >
      <app-theme-settings />
    </p-dialog>
  `,
  styles: [`
    :host { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .topbar-left { display: flex; align-items: center; gap: 1rem; }
    .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
    .user-name { font-size: 0.875rem; font-weight: 500; color: var(--app-text); }
  `],
})
export class TopbarComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly themeStore = inject(ThemeStore);
  protected showThemePanel = false;
}
