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
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule, FormsModule, RouterLink],
  template: `
    <div class="reflexa-auth-card">
      <p-card>
        <ng-template #header>
          <div style="text-align:center;padding:1.5rem 1.5rem 0">
            <h2 style="margin:0">Create Account</h2>
            <p style="color:var(--p-surface-500);margin-top:0.5rem">Join Reflexa</p>
          </div>
        </ng-template>
        @if (store.error(); as err) {
          <div style="margin-bottom:1rem">
            <p-message severity="error" [text]="err.message" styleClass="w-full" />
          </div>
          @if (err.validationErrors) {
            @for (field of objectEntries(err.validationErrors); track field[0]) {
              @for (msg of field[1]; track msg) {
                <div style="margin-bottom:0.4rem">
                  <p-message severity="warn" [text]="field[0] + ': ' + msg" styleClass="w-full" />
                </div>
              }
            }
          }
        }
        @if (store.successMessage(); as msg) {
          <div style="margin-bottom:1rem">
            <p-message severity="success" [text]="msg" styleClass="w-full" />
          </div>
        }
        <div class="field">
          <label for="email">Email *</label>
          <input id="email" pInputText type="email" [(ngModel)]="email" placeholder="you@example.com"
            [class.p-invalid]="submitted() && !isEmailValid()" style="width:100%" />
          @if (submitted() && !isEmailValid()) { <span class="field-error">Valid email is required</span> }
        </div>
        <div class="field">
          <label for="firstName">First Name</label>
          <input id="firstName" pInputText [(ngModel)]="firstName" style="width:100%" />
        </div>
        <div class="field">
          <label for="lastName">Last Name</label>
          <input id="lastName" pInputText [(ngModel)]="lastName" style="width:100%" />
        </div>
        <div class="field">
          <label for="password">Password *</label>
          <p-password id="password" [(ngModel)]="password" [toggleMask]="true"
            placeholder="Min 8 chars, 1 uppercase, 1 number" styleClass="w-full" inputStyleClass="w-full" />
          @if (submitted() && !isPasswordValid()) {
            <span class="field-error">Password must be at least 8 characters with 1 uppercase and 1 number</span>
          }
        </div>
        <div style="display:block;margin-bottom:1rem">
          <p-button label="Create Account" [loading]="store.loading()" [disabled]="store.loading()"
            (onClick)="submit()" styleClass="w-full" />
        </div>
        <p style="text-align:center;font-size:0.875rem;color:var(--p-surface-600)">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </p-card>
    </div>
  `
})
export class RegisterComponent {
  protected readonly store = inject(AuthStore);
  protected email = '';
  protected firstName = '';
  protected lastName = '';
  protected password = '';
  private readonly _submitted = signal(false);
  protected readonly submitted = this._submitted.asReadonly();
  protected readonly isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email));
  protected readonly isPasswordValid = computed(() =>
    this.password.length >= 8 && /[A-Z]/.test(this.password) && /[0-9]/.test(this.password)
  );
  protected objectEntries = Object.entries;
  async submit(): Promise<void> {
    this._submitted.set(true);
    if (!this.isEmailValid() || !this.isPasswordValid()) return;
    await this.store.register({
      email: this.email.trim().toLowerCase(),
      password: this.password,
      firstName: this.firstName || undefined,
      lastName: this.lastName || undefined
    });
  }
}
