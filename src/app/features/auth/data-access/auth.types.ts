import type { TokenPair } from '../../../core/models/auth.models';

export type {
  SafeUser,
  TokenPair,
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  RefreshTokenRequest,
  LogoutRequest,
  RegisterResponse,
  LoginResponse,
  MeResponse,
} from '../../../core/models/auth.models';

export interface RefreshTokenResponse {
  tokens: TokenPair;
}
