import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PERMISSAO_TOAST_KEY } from '../../app/util/permissao-helper.service';
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';

@Injectable({
  providedIn: 'root'
})
export class PermissoesGuard implements CanActivate {
  constructor(
    private readonly authState: AuthStateService,
    private readonly router: Router,
    private readonly logger: LoggerService,
    private readonly messageService: MessageService
  ) {}

  canActivate(): boolean {
    if (this.authState.podeGerenciarPermissoes()) {
      return true;
    }

    this.logger.warn('Acesso negado: rota de permissoes sem privilegio suficiente.');
    this.messageService.add({
      key: PERMISSAO_TOAST_KEY,
      severity: 'warn',
      summary: 'Acesso bloqueado',
      detail: 'Voce nao tem permissao para gerenciar perfis e permissoes.'
    });
    this.router.navigate(['/dashboard']);
    return false;
  }
}
