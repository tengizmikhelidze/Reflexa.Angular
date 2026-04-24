import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthStore } from '../data-access/auth.store';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, CardModule, InputTextModule, ButtonModule, MessageModule],
  template: `
    <div class="reflexa-auth-card">
      <p-card>
        <ng-template #header>
          <div style="text-align:center;padding:1.5rem 1.5rem 0">
            <h2 style="margin:0">Verify Email</h2>
            <p style="color:var(--p-surface-500);margin-top:0.5rem">Enter your verification token</p>
          </div>
        </ng-template>

        @if (store.error(); as err) {
          <div style="margin-bottom:1rem">
            <p-message severity="error" [text]="err.message" styleClass="w-full" />
          </div>
        }

        @if (success()) {
          <div style="margin-bottom:1rem">
            <p-message severity="success"
              text="Email verified successfully! You can now log in."
              styleClass="w-full" />
          </div>
          <p style="text-align:center"><a routerLink="/login">Go to Login</a></p>
        } @else {
          <div class="field">
            <label for="token">Verification Token</label>
            <input id="token" pInputText
              [ngModel]="token()" (ngModelChange)="token.set($event)"
              placeholder="Paste your token here" style="width:100%" />
          </div>
          <div style="display:block;margin-bottom:1rem">
            <p-button label="Verify Email"
              [loading]="store.loading()" [disabled]="!token() || store.loading()"
              (onClick)="verify()" styleClass="w-full" />
          </div>

          <div style="border-top:1px solid var(--p-surface-200);padding-top:1rem;margin-top:0.25rem">
              <p style="font-size:0.875rem;color:var(--p-surface-600);margin:0 0 0.75rem">
                Didn't receive an email or token expired?
              </p>
              <div class="field">
                <input pInputText type="email"
                  [ngModel]="resendEmail()" (ngModelChange)="resendEmail.set($event)"
                  placeholder="your@email.com"
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

          <p style="text-align:center;font-size:0.875rem;margin-top:1rem">
            <a routerLink="/login">Back to Login</a>
          </p>
        }
      </p-card>
    </div>
  `,
})
export class VerifyEmailPage implements OnInit {
  protected readonly store = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly token = signal('');
  private readonly _success = signal(false);
  protected readonly success = this._success.asReadonly();

  // ── Resend section ────────────────────────────────────────────────────────

  protected readonly resendEmail = signal('');
  private readonly _resendSubmitted = signal(false);
  private readonly _resendSuccess = signal(false);
  protected readonly resendSubmitted = this._resendSubmitted.asReadonly();
  protected readonly resendSuccess = this._resendSuccess.asReadonly();

  protected readonly isResendEmailValid = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.resendEmail()),
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const urlToken = this.route.snapshot.queryParamMap.get('token');
    if (urlToken) {
      this.token.set(urlToken);
      void this.verify();
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async verify(): Promise<void> {
    if (!this.token()) return;
    this._success.set(false);
    await this.store.verifyEmail(this.token());
    if (!this.store.error()) {
      this._success.set(true);
    }
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
