import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError, switchMap, catchError, finalize } from "rxjs";
import { LoadingService } from "../../app/util/loading-service";
import { AuthService } from "./auth-service";
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authState: AuthStateService,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService, // Serviço de loading
    private logger: LoggerService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ignora requests que não precisam de loading
    if (req.url.includes('/auth') || req.url.includes('/login/recupera-senha') || req.url.includes('/login/redefinir-senha')) {
      return next.handle(req);
    }

    this.loadingService.show();

    // Se o token está expirado, tenta fazer o refresh
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
        catchError(err => {
          this.logger.error('Falha ao atualizar token via refresh.', err);
          this.authState.limpar();
          this.router.navigate(['/login']);
          return throwError(() => err);
        }),
        finalize(() => this.loadingService.hide()) // Sempre finaliza
      );
    }

    // Token ainda válido
    const accessToken = this.authState.obterTokenAcesso();
    if (accessToken) {
      const authReq = req.clone({
        withCredentials: true,
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return next.handle(authReq).pipe(
        catchError(err => {
          if (err.status === 401) {
            this.logger.warn('Requisição 401: limpando sessão e redirecionando para login.');
            this.authState.limpar();
            this.router.navigate(['/login']);
          }
          return throwError(() => err);
        }),
        finalize(() => this.loadingService.hide()) // Finaliza após a request
      );
    }

    // Sem token: ainda enviamos cookies (para permitir refresh-side em backends que validam sessão por cookie)
    return next.handle(req.clone({ withCredentials: true })).pipe(
      finalize(() => this.loadingService.hide())
    );
  }
}
