import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { JwtResponse } from '../../app/models/jwt-response';
import { Role } from '../../app/models/enums/role-enum';
import { AuthStorageService } from './auth-storage-service';
import { LoggerService } from '../logger.service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  // Observables de estado em memória (fonte da verdade no front)
  private readonly tokenAcesso$ = new BehaviorSubject<string | null>(null);
  private readonly papeis$ = new BehaviorSubject<string[]>([]);
  private readonly expiraEm$ = new BehaviorSubject<number>(0);

  // Transição: espelhar no storage legado para não quebrar comportamento em reload
  private readonly espelharNoStorage: boolean = true;

  constructor(private readonly storageLegado: AuthStorageService, private readonly logger: LoggerService) {
    // Por ora, reidratamos do storage legado (até migrarmos refresh para cookie HttpOnly)
    try {
      const token = this.storageLegado.getAccessToken();
      const roles = this.storageLegado.getRoles();
      const exp = this.storageLegado.getExpirationTime?.() ?? 0;
      if (token) {
        this.tokenAcesso$.next(token);
        this.papeis$.next(roles || []);
        this.expiraEm$.next(exp || 0);
      }
    } catch (erro) {
      this.logger.error('Falha ao reidratar estado de autenticação.', erro);
    }
  }

  // Leituras
  obterTokenAcesso(): string | null { return this.tokenAcesso$.value; }
  obterPapeis(): string[] { return this.papeis$.value; }
  obterInstanteExpiracao(): number { return this.expiraEm$.value; }
  estaLogado(): boolean {
    const token = this.obterTokenAcesso();
    const exp = this.obterInstanteExpiracao();
    return !!token && Date.now() < exp;
  }
  tokenExpirado(): boolean { return !this.obterTokenAcesso() || Date.now() > this.obterInstanteExpiracao(); }
  possuiPapel(papel: Role): boolean { return (this.obterPapeis() || []).includes(papel); }

  // Escritas
  definirSessaoAPartirDoJwt(resposta: JwtResponse): void {
    const token = resposta.accessToken ?? '';
    const expiraEm = Date.now() + (resposta.expiresIn ?? 0) * 1000;
    const roles = resposta.roles ?? [];
    this.definirSessao(token, roles, expiraEm);
    // Mantemos o refresh no storage legado durante a transição
    if (this.espelharNoStorage) {
      this.storageLegado.storeTokens(
        resposta.accessToken ?? '',
        resposta.refreshToken ?? '',
        roles,
        resposta.expiresIn ?? 0,
        resposta.idCliente ?? 0,
        resposta.nomeCliente ?? ''
      );
    }
  }

  definirSessao(tokenAcesso: string, papeis: string[], expiraEm: number): void {
    this.tokenAcesso$.next(tokenAcesso);
    this.papeis$.next(papeis || []);
    this.expiraEm$.next(expiraEm || 0);
    if (this.espelharNoStorage) {
      // Persistimos o mínimo no storage legado para preservar comportamento em reload
      const segundos = Math.max(0, Math.floor((expiraEm - Date.now()) / 1000));
      this.storageLegado.storeTokens(tokenAcesso, this.storageLegado.getRefreshToken() || '', papeis, segundos, 0, '');
    }
  }

  limpar(): void {
    this.tokenAcesso$.next(null);
    this.papeis$.next([]);
    this.expiraEm$.next(0);
    this.storageLegado.clear();
  }
}
