
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from 'rxjs/operators';
import { LoginRequest } from "../../app/components/login/login-request";
import { JwtResponse } from "../../app/models/jwt-response";
import { environment } from "../../environments/environment";
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient, private authState: AuthStateService, private logger: LoggerService) { }


  // Login: delega persistência de sessão ao AuthStateService (memória). Cookies HttpOnly são enviados pelo navegador.
  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http
      .post<JwtResponse>(`${environment.url_back}auth`, loginRequest, { withCredentials: true })
      .pipe(
        tap(res => this.armazenarTokens(res))
      );
  }


  // Refresh: agora usa cookie HttpOnly no backend (sem enviar refreshToken no body)
  refreshToken(): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(environment.url_back + 'auth/refresh', {}, { withCredentials: true })
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
