import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, switchMap, catchError, throwError, of } from "rxjs";
import { AuthService } from "./auth-service";
import { AuthStorageService } from "./auth-storage-service";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authStorage: AuthStorageService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ignorar requisições para login e refresh
    if (req.url.includes('/auth') || req.url.includes('/auth/refresh') || req.url.includes('/login/recupera-senha') || req.url.includes('/login/redefinir-senha') ) {
      return next.handle(req);
    }

    // Se o token está expirado, tenta fazer o refresh
    if (this.authStorage.isTokenExpired()) {
      const refreshToken = this.authStorage.getRefreshToken();
      if (!refreshToken) {
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
        })
      );
    }

    // Token ainda válido
    const accessToken = this.authStorage.getAccessToken();
    const authReq = accessToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : req;

    return next.handle(authReq);
  }
}