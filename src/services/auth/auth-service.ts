
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from 'rxjs/operators';
import { LoginRequest } from "../../app/components/login/login-request";
import { JwtResponse } from "../../app/models/jwt-response";
import { environment } from "../../environments/environment";
import { AuthStorageService } from "./auth-storage-service";
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient, private storage: AuthStorageService, private authState: AuthStateService, private logger: LoggerService) { }


  // Login: delega persistência de sessão ao AuthStateService (memória + transição para storage legado)
  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http
      .post<JwtResponse>(`${environment.url_back}auth`, loginRequest)
      .pipe(
        tap(res => this.armazenarTokens(res))
      );
  }


  // Refresh: por enquanto ainda utiliza o refreshToken do storage legado
  refreshToken(): Observable<JwtResponse> {
    const refreshToken = this.storage.getRefreshToken();
    return this.http.post<JwtResponse>(environment.url_back + 'auth/refresh', { refreshToken })
      .pipe(
        tap(res => this.armazenarTokens(res))
      );
  }

  logout(): void {
    this.logger.info('Encerrando sessão do usuário.');
    this.authState.limpar();
  }

  private armazenarTokens(res: JwtResponse): void {
    this.logger.info('Sessão atualizada com novo token de acesso.');
    this.authState.definirSessaoAPartirDoJwt(res);
  }

}
