import { inject, Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { LoginRequest, LoginResponse, LogoutRequest, MeResponse, RefreshTokenRequest, RegisterRequest, RegisterResponse, TokenPair, VerifyEmailRequest } from '../models/auth.models';
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiClientService);
  register(body: RegisterRequest): Promise<RegisterResponse> {
    return this.api.post<RegisterRequest, RegisterResponse>('/auth/register', body);
  }
  login(body: LoginRequest): Promise<LoginResponse> {
    return this.api.post<LoginRequest, LoginResponse>('/auth/login', body);
  }
  verifyEmail(body: VerifyEmailRequest): Promise<{ message: string }> {
    return this.api.post<VerifyEmailRequest, { message: string }>('/auth/verify-email', body);
  }
  refreshToken(body: RefreshTokenRequest): Promise<{ tokens: TokenPair }> {
    return this.api.post<RefreshTokenRequest, { tokens: TokenPair }>('/auth/refresh-token', body);
  }
  logout(body: LogoutRequest): Promise<{ message: string }> {
    return this.api.post<LogoutRequest, { message: string }>('/auth/logout', body);
  }
  me(): Promise<MeResponse> {
    return this.api.get<MeResponse>('/auth/me');
  }
}
