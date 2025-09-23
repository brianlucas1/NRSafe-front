import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError, switchMap, catchError, finalize } from "rxjs";
import { LoadingService } from "../../app/util/loading-service";
import { AuthService } from "./auth-service";
import { AuthStorageService } from "./auth-storage-service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authStorage: AuthStorageService,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService // Injeta o loading service
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ignora requests que não precisam de loading
    if (req.url.includes('/auth') || req.url.includes('/login/recupera-senha') || req.url.includes('/login/redefinir-senha')) {
      return next.handle(req);
    }

    this.loadingService.show(); 

    // Se o token está expirado, tenta fazer o refresh
    if (this.authStorage.isTokenExpired()) {
      const refreshToken = this.authStorage.getRefreshToken();
      if (!refreshToken) {
        this.loadingService.hide(); // Sempre desativa o loading antes de sair
        this.authStorage.clear();
        this.router.navigate(['/login']);
        return throwError(() => new Error('Refresh token ausente'));
      }

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          const newAccessToken = this.authStorage.getAccessToken();
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`
            }
          });
          return next.handle(cloned);
        }),
        catchError(err => {
          this.authStorage.clear();
          this.router.navigate(['/login']);
          return throwError(() => err);
        }),
        finalize(() => this.loadingService.hide()) // Sempre finaliza
      );
    }

    // Token ainda válido
    const accessToken = this.authStorage.getAccessToken();
    if (accessToken) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return next.handle(authReq).pipe(
        catchError(err => {
          if (err.status === 401) {
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
