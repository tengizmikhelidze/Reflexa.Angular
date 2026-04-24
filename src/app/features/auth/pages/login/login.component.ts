import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../auth.store';
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule, FormsModule, RouterLink],
  template: `
    <div class="reflexa-auth-card">
      <p-card>
        <ng-template #header>
          <div style="text-align:center;padding:1.5rem 1.5rem 0">
            <h2 style="margin:0">Welcome back</h2>
            <p style="color:var(--p-surface-500);margin-top:0.5rem">Sign in to Reflexa</p>
          </div>
        </ng-template>
        @if (store.error(); as err) {
          <div style="margin-bottom:1rem">
            <p-message severity="error" [text]="err.message" styleClass="w-full" />
          </div>
        }
        <div class="field">
          <label for="email">Email</label>
          <input id="email" pInputText type="email" [(ngModel)]="email" placeholder="you@example.com"
            [class.p-invalid]="submitted() && !isEmailValid()" (keyup.enter)="submit()" style="width:100%" />
          @if (submitted() && !isEmailValid()) {
            <span class="field-error">Valid email is required</span>
          }
        </div>
        <div class="field">
          <label for="password">Password</label>
          <p-password id="password" [(ngModel)]="password" [feedback]="false" [toggleMask]="true"
            placeholder="••••••••" styleClass="w-full" inputStyleClass="w-full"
            (keyup.enter)="submit()" />
          @if (submitted() && !isPasswordValid()) {
            <span class="field-error">Password is required</span>
          }
        </div>
        <div style="display:block;margin-bottom:1rem">
          <p-button label="Sign In" [loading]="store.loading()" [disabled]="store.loading()"
            (onClick)="submit()" styleClass="w-full" />
        </div>
        <p style="text-align:center;font-size:0.875rem;color:var(--p-surface-600)">
          Don't have an account? <a routerLink="/register">Register</a>
        </p>
        <p style="text-align:center;font-size:0.875rem;color:var(--p-surface-600)">
          <a routerLink="/verify-email">Verify email</a>
        </p>
      </p-card>
    </div>
  `
})
export class LoginComponent {
  protected readonly store = inject(AuthStore);
  protected email = '';
  protected password = '';
  private readonly _submitted = signal(false);
  protected readonly submitted = this._submitted.asReadonly();
  protected readonly isEmailValid = computed(() => this.email.includes('@'));
  protected readonly isPasswordValid = computed(() => this.password.length > 0);
  async submit(): Promise<void> {
    this._submitted.set(true);
    if (!this.isEmailValid() || !this.isPasswordValid()) return;
    await this.store.login({ email: this.email.trim().toLowerCase(), password: this.password });
  }
}
