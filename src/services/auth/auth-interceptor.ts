import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError, switchMap, catchError, finalize } from "rxjs";
import { LoadingService } from "../../app/util/loading-service";
import { AuthService } from "./auth-service";
import { AuthStorageService } from "./auth-storage-service";
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authStorage: AuthStorageService,
    private authState: AuthStateService,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService, // Injeta o loading service
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
      const refreshToken = this.authStorage.getRefreshToken();
      if (!refreshToken) {
        this.loadingService.hide(); // Sempre desativa o loading antes de sair
        this.authStorage.clear();
        this.router.navigate(['/login']);
        return throwError(() => new Error('Refresh token ausente'));
      }

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          const newAccessToken = this.authState.obterTokenAcesso();
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`
            }
          });
          return next.handle(cloned);
        }),
        catchError(err => {
          this.logger.error('Falha ao atualizar token via refresh.', err);
          this.authStorage.clear();
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
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return next.handle(authReq).pipe(
        catchError(err => {
          if (err.status === 401) {
            this.logger.warn('Requisição 401: limpando sessão e redirecionando para login.');
            this.authStorage.clear();
            this.router.navigate(['/login']);
          }
          return throwError(() => err);
        }),
        finalize(() => this.loadingService.hide()) // Finaliza após a request
      );
    }

    return next.handle(req).pipe(
      finalize(() => this.loadingService.hide())
    );
  }
}
