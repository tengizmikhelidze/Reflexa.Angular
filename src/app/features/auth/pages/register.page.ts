import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthStore } from '../data-access/auth.store';

@Component({
  selector: 'app-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
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
            @for (entry of objectEntries(err.validationErrors); track entry[0]) {
              @for (msg of entry[1]; track msg) {
                <div style="margin-bottom:0.4rem">
                  <p-message severity="warn" [text]="entry[0] + ': ' + msg" styleClass="w-full" />
                </div>
              }
            }
          }
        }

        @if (success()) {
          <div style="margin-bottom:1rem">
            <p-message severity="success"
              text="Registration successful! Please check your email to verify your account."
              styleClass="w-full" />
          </div>

          <div style="border-top:1px solid var(--p-surface-200);padding-top:1rem;margin-top:0.5rem">
            <p style="font-size:0.875rem;color:var(--p-surface-600);margin:0 0 0.75rem">
              Didn't receive the email?
            </p>
            @if (store.resendError(); as err) {
              <div style="margin-bottom:0.75rem">
                <p-message severity="error" [text]="err.message" styleClass="w-full" />
              </div>
            }
            @if (resendSuccess()) {
              <div style="margin-bottom:0.75rem">
                <p-message severity="success"
                  text="Verification email resent! Please check your inbox."
                  styleClass="w-full" />
              </div>
            }
            <p-button label="Resend Verification Email" severity="secondary"
              [loading]="store.resendLoading()" [disabled]="store.resendLoading() || resendSuccess()"
              (onClick)="resend()" styleClass="w-full" />
          </div>

          <p style="text-align:center;margin-top:1rem">
            <a routerLink="/verify-email">Enter verification token</a>
          </p>
        } @else {
          <div class="field">
            <label for="email">Email *</label>
            <input id="email" pInputText type="email"
              [ngModel]="email()" (ngModelChange)="email.set($event)"
              placeholder="you@example.com"
              [class.p-invalid]="submitted() && !isEmailValid()"
              style="width:100%" />
            @if (submitted() && !isEmailValid()) {
              <span class="field-error">Valid email is required</span>
            }
          </div>

          <div class="field">
            <label for="firstName">First Name</label>
            <input id="firstName" pInputText
              [ngModel]="firstName()" (ngModelChange)="firstName.set($event)"
              style="width:100%" />
          </div>

          <div class="field">
            <label for="lastName">Last Name</label>
            <input id="lastName" pInputText
              [ngModel]="lastName()" (ngModelChange)="lastName.set($event)"
              style="width:100%" />
          </div>

          <div class="field">
            <label for="password">Password *</label>
            <p-password id="password"
              [ngModel]="password()" (ngModelChange)="password.set($event)"
              [toggleMask]="true" [feedback]="false"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              styleClass="w-full" inputStyleClass="w-full" />
            @if (submitted() && !isPasswordValid()) {
              <span class="field-error">
                Password must be at least 8 characters with 1 uppercase and 1 number
              </span>
            }
          </div>

          <div style="display:block;margin-bottom:1rem">
            <p-button label="Create Account"
              [loading]="store.loading()" [disabled]="store.loading()"
              (onClick)="submit()" styleClass="w-full" />
          </div>

          <p style="text-align:center;font-size:0.875rem;color:var(--p-surface-600)">
            Already have an account? <a routerLink="/login">Sign in</a>
          </p>
        }
      </p-card>
    </div>
  `,
})
export class RegisterPage {
  protected readonly store = inject(AuthStore);
  protected readonly objectEntries = Object.entries;

  protected readonly email = signal('');
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly password = signal('');
  private readonly _submitted = signal(false);
  private readonly _success = signal(false);
  private readonly _resendSuccess = signal(false);
  protected readonly submitted = this._submitted.asReadonly();
  protected readonly success = this._success.asReadonly();
  protected readonly resendSuccess = this._resendSuccess.asReadonly();

  protected readonly isEmailValid = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()),
  );
  protected readonly isPasswordValid = computed(() =>
    this.password().length >= 8 &&
    /[A-Z]/.test(this.password()) &&
    /[0-9]/.test(this.password()),
  );

  async submit(): Promise<void> {
    this._submitted.set(true);
    if (!this.isEmailValid() || !this.isPasswordValid()) return;
    this._success.set(false);
    await this.store.register({
      email: this.email().trim().toLowerCase(),
      password: this.password(),
      firstName: this.firstName() || undefined,
      lastName: this.lastName() || undefined,
    });
    if (!this.store.error()) {
      this._success.set(true);
    }
  }

  async resend(): Promise<void> {
    this._resendSuccess.set(false);
    await this.store.resendVerificationEmail(this.email().trim().toLowerCase());
    if (!this.store.resendError()) {
      this._resendSuccess.set(true);
    }
  }
}
