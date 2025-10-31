import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { JwtResponse } from '../../app/models/jwt-response';
import { Role } from '../../app/models/enums/role-enum';
import { LoggerService } from '../logger.service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  // Observables de estado em memória (fonte da verdade no front)
  private readonly tokenAcesso$ = new BehaviorSubject<string | null>(null);
  private readonly papeis$ = new BehaviorSubject<string[]>([]);
  private readonly expiraEm$ = new BehaviorSubject<number>(0);
  private readonly rotuloUsuario$ = new BehaviorSubject<string | null>(null);


  constructor(private readonly logger: LoggerService) {
    // Por ora, reidratamos do storage legado (até migrarmos refresh para cookie HttpOnly)
    try {
      // Sem reidratação do storage: o primeiro request autenticado acionará o refresh via cookie
    } catch (erro) {
      this.logger.error('Falha ao reidratar estado de autenticação.', erro);
    }
  }

  // Leituras
  obterTokenAcesso(): string | null {
     return this.tokenAcesso$.value; 
    }

  obterPapeis(): string[] { 
    return this.papeis$.value; 
  }

  obterInstanteExpiracao(): number {
     return this.expiraEm$.value;
     }

  obterRotuloUsuario(): string | null {
     return this.rotuloUsuario$.value;
     }

  observarRotuloUsuario() {
     return this.rotuloUsuario$.asObservable();
     }

  estaLogado(): boolean {
    const token = this.obterTokenAcesso();
    const exp = this.obterInstanteExpiracao();
    return !!token && Date.now() < exp;
  }

  tokenExpirado(): boolean {
     return !this.obterTokenAcesso() || Date.now() > this.obterInstanteExpiracao();
     }

  possuiPapel(papel: Role): boolean { 
    return (this.obterPapeis() || []).includes(papel);
   }

  // Escritas
  definirSessaoAPartirDoJwt(resposta: JwtResponse): void {
    const token = resposta.accessToken ?? '';
    const expiraEm = Date.now() + (resposta.expiresIn ?? 0) * 1000;
    const roles = resposta.roles ?? [];
    const rotulo = resposta.loggedUserLabel ?? null;
    this.definirSessao(token, roles, expiraEm);
    this.rotuloUsuario$.next(rotulo);
    // Mantemos o refresh no storage legado durante a transição
    // Não persistimos mais no storage; refresh fica a cargo do cookie HttpOnly
  }

  definirSessao(tokenAcesso: string, papeis: string[], expiraEm: number): void {
    this.tokenAcesso$.next(tokenAcesso);
    this.papeis$.next(papeis || []);
    this.expiraEm$.next(expiraEm || 0);
    // Não persistimos mais no storage
  }

  limpar(): void {
    this.tokenAcesso$.next(null);
    this.papeis$.next([]);
    this.expiraEm$.next(0);
    this.rotuloUsuario$.next(null);
    // Nada adicional a limpar além do estado em memória
  }
}
