import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth-service";
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authState: AuthStateService,
    private logger: LoggerService,
    private authService: AuthService) {}

  async canActivate(): Promise<boolean> {
    // Se já está logado em memória, libera
    if (this.authState.estaLogado()) {
      return true;
    }

    // Tentativa silenciosa de refresh (ex.: após F5)
    try {
      await firstValueFrom(this.authService.refreshToken());
      if (this.authState.estaLogado()) {
        return true;
      }
    } catch (err) {
      this.logger.warn('Refresh inicial falhou no guard; redirecionando para login.');
    }

    this.router.navigate(['/login']);
    return false;
  }
}
