import { ISODateString, UUID } from './api.models';
export interface SafeUser {
  id: UUID;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
  createdAt: ISODateString;
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface VerifyEmailRequest {
  token: string;
}
export interface RefreshTokenRequest {
  refreshToken: string;
}
export interface LogoutRequest {
  refreshToken: string;
}
export interface RegisterResponse {
  user: SafeUser;
}
export interface LoginResponse {
  user: SafeUser;
  tokens: TokenPair;
}
export interface MeResponse {
  user: SafeUser;
}
