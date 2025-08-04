import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly ROLES_KEY = 'roles';
  private readonly EXPIRES_AT_KEY = 'expiresAt';

  storeTokens(accessToken: string, refreshToken: string, roles: string[], expiresIn: number, idCliente: number, nomeCliente: string): void {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.ROLES_KEY, JSON.stringify(roles));
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }


  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getRoles(): string[] {
    const roles = localStorage.getItem(this.ROLES_KEY);
    return roles ? JSON.parse(roles) : [];
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    return !expiresAt || Date.now() > parseInt(expiresAt, 10);
  }

  clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ROLES_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  isLoggedIn(): boolean {
  const token = this.getAccessToken();
  const expiresAt = this.getExpirationTime();

  return !!token && Date.now() < expiresAt;
}

getExpirationTime(): number {
  const exp = localStorage.getItem(this.EXPIRES_AT_KEY);
  return exp ? parseInt(exp, 10) : 0;
}

}