import { Injectable } from "@angular/core";
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { PERMISSAO_TOAST_KEY } from '../../app/util/permissao-helper.service';
import { LoggerService } from '../logger.service';
import { AuthService } from "./auth-service";
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly rotasPermitidasSemAssinatura = ['/pagamento/historico', '/perfil'];

  constructor(
    private router: Router,
    private authState: AuthStateService,
    private logger: LoggerService,
    private authService: AuthService,
    private messageService: MessageService) {}

  async canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (this.authState.estaLogado()) {
      return this.validarAcessoPorAssinatura(state.url);
    }

    try {
      await firstValueFrom(this.authService.refreshToken());
      if (this.authState.estaLogado()) {
        return this.validarAcessoPorAssinatura(state.url);
      }
    } catch (err) {
      this.logger.warn('Refresh inicial falhou no guard; redirecionando para login.');
    }

    this.router.navigate(['/login']);
    return false;
  }

  private validarAcessoPorAssinatura(url: string): boolean {
    if (!this.authState.isCliente() || this.authState.obterAssinaturaAtiva()) {
      return true;
    }

    if (this.ehRotaPermitidaSemAssinatura(url)) {
      return true;
    }

    this.logger.warn('Cliente com assinatura inativa tentou acessar rota bloqueada.', url);
    this.messageService.add({
      key: PERMISSAO_TOAST_KEY,
      severity: 'warn',
      summary: 'Acesso bloqueado',
      detail: 'Voce so podera continuar utilizando o sistema apos regularizar o pagamento.'
    });
    this.router.navigate(['/pagamento/historico']);
    return false;
  }

  private ehRotaPermitidaSemAssinatura(url: string): boolean {
    const urlSemQuery = (url || '').split('?')[0].split('#')[0];
    return this.rotasPermitidasSemAssinatura.some((rota) => urlSemQuery === rota || urlSemQuery.startsWith(`${rota}/`));
  }
}
