
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from 'rxjs/operators';
import { LoginRequest } from "../../app/components/login/login-request";
import { JwtResponse } from "../../app/models/jwt-response";
import { environment } from "../../environments/environment";
import { AuthStorageService } from "./auth-storage-service";

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient, private storage: AuthStorageService) { }


  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${environment.url_back}auth`, loginRequest);
  }


  refreshToken(): Observable<JwtResponse> {
    const refreshToken = this.storage.getRefreshToken();
    return this.http.post<JwtResponse>(environment.url_back + 'auth/refresh', { refreshToken })
      .pipe(
        tap(res => this.armazenarTokens(res))
      );
  }

  logout(): void {
    this.storage.clear();
  }

  private armazenarTokens(res: JwtResponse): void {
    this.storage.storeTokens(
      res.accessToken ?? '',
      res.refreshToken ?? '',
      res.roles ?? [''],
      res.expiresIn ?? 0,
      res.idCliente ?? 0,
      res.nomeCliente ?? ''
    );
  }

}