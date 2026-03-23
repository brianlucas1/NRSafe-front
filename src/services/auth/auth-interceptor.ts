import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoadingService } from '../../app/util/loading-service';
import { PermissaoHelperService } from '../../app/util/permissao-helper.service';
import { LoggerService } from '../logger.service';
import { AuthService } from './auth-service';
import { AuthStateService } from './auth-state.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly authState: AuthStateService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly loadingService: LoadingService,
    private readonly permissaoHelper: PermissaoHelperService,
    private readonly logger: LoggerService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.ehRequisicaoSemControle(req.url)) {
      return next.handle(req);
    }

    if (this.deveValidarPermissao(req.url) && !this.permissaoHelper.validarRequisicaoOuAvisar(req.method, req.url)) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            statusText: 'Forbidden',
            url: req.url,
            error: {
              code: 'PERMISSAO_NEGADA_FRONT',
              message: 'Usuario sem permissao para executar esta acao.'
            }
          })
      );
    }

    this.loadingService.show();

    if (this.authState.tokenExpirado()) {
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          const newAccessToken = this.authState.obterTokenAcesso();
          const cloned = req.clone({
            withCredentials: true,
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`
            }
          });
          return next.handle(cloned);
        }),
        catchError((err) => {
          this.logger.error('Falha ao atualizar token via refresh.', err);
          this.authState.limpar();
          this.router.navigate(['/login']);
          return throwError(() => err);
        }),
        finalize(() => this.loadingService.hide())
      );
    }

    const accessToken = this.authState.obterTokenAcesso();
    if (accessToken) {
      const authReq = req.clone({
        withCredentials: true,
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return next.handle(authReq).pipe(
        catchError((err) => {
          if (err.status === 401) {
            this.logger.warn('Requisicao 401: limpando sessao e redirecionando para login.');
            this.authState.limpar();
            this.router.navigate(['/login']);
          }
          return throwError(() => err);
        }),
        finalize(() => this.loadingService.hide())
      );
    }

    return next.handle(req.clone({ withCredentials: true })).pipe(finalize(() => this.loadingService.hide()));
  }

  private ehRequisicaoSemControle(url: string): boolean {
    return url.includes('/auth') || url.includes('/login/recupera-senha') || url.includes('/login/redefinir-senha');
  }

  private deveValidarPermissao(url: string): boolean {
    const baseUrl = environment.url_back;
    if (!baseUrl) {
      return false;
    }
    const semBarraFinal = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return url.startsWith(baseUrl) || url.startsWith(semBarraFinal);
  }
}
