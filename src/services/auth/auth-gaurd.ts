import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth-service";
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authState: AuthStateService,
    private logger: LoggerService) {}

  canActivate(): boolean {
    if (this.authState.estaLogado()) {
      return true;
    } else {
      this.logger.warn('Acesso negado: usuário não autenticado. Redirecionando para login.');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
