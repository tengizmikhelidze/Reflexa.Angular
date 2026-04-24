import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../auth.store';
@Component({
  selector: 'app-verify-email',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, InputTextModule, ButtonModule, MessageModule, FormsModule, RouterLink],
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
        @if (store.successMessage(); as msg) {
          <div style="margin-bottom:1rem">
            <p-message severity="success" [text]="msg" styleClass="w-full" />
          </div>
          <p style="text-align:center"><a routerLink="/login">Go to Login</a></p>
        }
        @if (!store.successMessage()) {
          <div class="field">
            <label for="token">Verification Token</label>
            <input id="token" pInputText [(ngModel)]="token" placeholder="Paste your token here" style="width:100%" />
          </div>
          <div style="display:block;margin-bottom:1rem">
            <p-button label="Verify Email" [loading]="store.loading()" [disabled]="!token || store.loading()"
              (onClick)="verify()" styleClass="w-full" />
          </div>
          <p style="text-align:center;font-size:0.875rem"><a routerLink="/login">Back to Login</a></p>
        }
      </p-card>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  protected readonly store = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  protected token = '';
  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    if (tokenParam) {
      this.token = tokenParam;
      this.verify();
    }
  }
  async verify(): Promise<void> {
    if (!this.token) return;
    await this.store.verifyEmail(this.token);
  }
}
