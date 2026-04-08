import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';

@Injectable({
  providedIn: 'root'
})
export class SuporteGuard implements CanActivate {
  constructor(
    private readonly authState: AuthStateService,
    private readonly router: Router,
    private readonly logger: LoggerService
  ) {}

  canActivate(): boolean {
    if (this.authState.isSuporte()) {
      return true;
    }

    this.logger.warn('Acesso negado: rota disponivel apenas para suporte.');
    this.router.navigate(['/dashboard']);
    return false;
  }
}
