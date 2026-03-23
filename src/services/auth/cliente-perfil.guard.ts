import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';

@Injectable({
  providedIn: 'root'
})
export class ClientePerfilGuard implements CanActivate {
  constructor(
    private readonly authState: AuthStateService,
    private readonly router: Router,
    private readonly logger: LoggerService
  ) {}

  canActivate(): boolean {
    if (this.authState.isCliente()) {
      return true;
    }

    this.logger.warn('Acesso negado: rota de pagamento disponivel apenas para perfil cliente.');
    this.router.navigate(['/dashboard']);
    return false;
  }
}
