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
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
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
          <input id="email" pInputText type="email"
            [ngModel]="email()" (ngModelChange)="email.set($event)"
            placeholder="you@example.com"
            [class.p-invalid]="submitted() && !isEmailValid()"
            (keyup.enter)="submit()"
            style="width:100%" />
          @if (submitted() && !isEmailValid()) {
            <span class="field-error">Valid email is required</span>
          }
        </div>

        <div class="field">
          <label for="password">Password</label>
          <p-password id="password"
            [ngModel]="password()" (ngModelChange)="password.set($event)"
            [feedback]="false" [toggleMask]="true"
            placeholder="••••••••" styleClass="w-full" inputStyleClass="w-full"
            (keyup.enter)="submit()" />
          @if (submitted() && !isPasswordValid()) {
            <span class="field-error">Password is required</span>
          }
        </div>

        <div style="display:block;margin-bottom:1rem">
          <p-button label="Sign In"
            [loading]="store.loading()" [disabled]="store.loading()"
            (onClick)="submit()" styleClass="w-full" />
        </div>

        @if (showResendSection()) {
          <div style="border-top:1px solid var(--p-surface-200);padding-top:1rem;margin-top:0.5rem">
            <p style="font-size:0.875rem;color:var(--p-surface-600);margin:0 0 0.75rem">
              Resend verification email
            </p>
            <div class="field">
              <input pInputText type="email"
                [ngModel]="resendEmail()" (ngModelChange)="resendEmail.set($event)"
                placeholder="you@example.com"
                [class.p-invalid]="resendSubmitted() && !isResendEmailValid()"
                style="width:100%" />
              @if (resendSubmitted() && !isResendEmailValid()) {
                <span class="field-error">Valid email is required</span>
              }
            </div>
            @if (store.resendError(); as err) {
              <div style="margin-bottom:0.75rem">
                <p-message severity="error" [text]="err.message" styleClass="w-full" />
              </div>
            }
            @if (resendSuccess()) {
              <div style="margin-bottom:0.75rem">
                <p-message severity="success"
                  text="Verification email sent! Please check your inbox."
                  styleClass="w-full" />
              </div>
            }
            <p-button label="Resend Verification Email" severity="secondary"
              [loading]="store.resendLoading()" [disabled]="store.resendLoading()"
              (onClick)="resend()" styleClass="w-full" />
          </div>
        }

        <p style="text-align:center;font-size:0.875rem;color:var(--p-surface-600);margin-top:1rem">
          Don't have an account? <a routerLink="/register">Register</a>
        </p>
        <p style="text-align:center;font-size:0.875rem;color:var(--p-surface-600)">
          <a routerLink="/verify-email">Verify email</a>
        </p>
      </p-card>
    </div>
  `,
})
export class LoginPage {
  protected readonly store = inject(AuthStore);

  protected readonly email = signal('');
  protected readonly password = signal('');
  private readonly _submitted = signal(false);
  protected readonly submitted = this._submitted.asReadonly();

  protected readonly isEmailValid = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()),
  );
  protected readonly isPasswordValid = computed(() => this.password().length > 0);

  // ── Resend section ────────────────────────────────────────────────────────

  protected readonly resendEmail = signal('');
  private readonly _resendSubmitted = signal(false);
  private readonly _resendSuccess = signal(false);
  protected readonly resendSubmitted = this._resendSubmitted.asReadonly();
  protected readonly resendSuccess = this._resendSuccess.asReadonly();

  protected readonly isResendEmailValid = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.resendEmail()),
  );

  /** Show resend section only when backend signals the email is unverified (403). */
  protected readonly showResendSection = computed(() => {
    const err = this.store.error();
    return !!err?.isForbidden && /verif/i.test(err.message);
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  async submit(): Promise<void> {
    this._submitted.set(true);
    if (!this.isEmailValid() || !this.isPasswordValid()) return;
    // Pre-fill resend email so the section is ready if login returns 403.
    this.resendEmail.set(this.email().trim().toLowerCase());
    this._resendSuccess.set(false);
    this.store.clearResendError();
    await this.store.login({ email: this.email().trim().toLowerCase(), password: this.password() });
  }

  async resend(): Promise<void> {
    this._resendSubmitted.set(true);
    if (!this.isResendEmailValid()) return;
    this._resendSuccess.set(false);
    await this.store.resendVerificationEmail(this.resendEmail().trim().toLowerCase());
    if (!this.store.resendError()) {
      this._resendSuccess.set(true);
    }
  }
}
