import { apiPost } from "./api";

export type LoginRequest = {
  login_name: string;
  password: string;
};

export type LoginResponse = {
  status: string;
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

const TOKEN_KEY = "cabinet_access_token";
const LOGIN_NAME_KEY = "cabinet_login_name";

export async function login(
  loginName: string,
  password: string,
): Promise<LoginResponse> {
  const request: LoginRequest = {
    login_name: loginName,
    password,
  };

  return apiPost<LoginResponse>(
    "/auth/login",
    request,
    "none",
  );
}

export function saveAuth(
  accessToken: string,
  loginName: string,
): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(LOGIN_NAME_KEY, loginName);
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LOGIN_NAME_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getLoginName(): string | null {
  return localStorage.getItem(LOGIN_NAME_KEY);
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}