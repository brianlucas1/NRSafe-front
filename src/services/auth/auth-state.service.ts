import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, distinctUntilChanged } from 'rxjs';
import { JwtResponse } from '../../app/models/jwt-response';
import { LoggerService } from '../logger.service';

@Injectable({ providedIn: 'root' })

export class AuthStateService {
  // Observables de estado em memória (fonte da verdade no front)
  private readonly tokenAcesso$ = new BehaviorSubject<string | null>(null);
  private readonly permissoes$ = new BehaviorSubject<string[]>([]);
  private readonly expiraEm$ = new BehaviorSubject<number>(0);
  private readonly rotuloUsuario$ = new BehaviorSubject<string | null>(null);


  // Leituras
  obterTokenAcesso(): string | null {
    return this.tokenAcesso$.value;
  }

  obterPermissoes(): string[] {
    return this.permissoes$.value;
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

  observarAutenticado(): Observable<boolean> {
    // Observa mudanças de token/expiração e emite status de autenticação
    return combineLatest([
      this.tokenAcesso$.asObservable(),
      this.expiraEm$.asObservable()
    ]).pipe(
      map(([token, exp]) => !!token && Date.now() < exp),
      distinctUntilChanged()
    );
  }

  
  /*
    observarAutenticado(): Observable<boolean> {
    // Observa mudanças de token/expiração e emite status de autenticação
    return combineLatest([
      this.tokenAcesso$.asObservable(),
      this.expiraEm$.asObservable(),
      this.clienteUser$.asObservable(),
      this.assinaturaAtiva$.asObservable()
    ]).pipe(
      map(([token, exp, clienteUser, assinaturaAtiva]) => {
        const base = !!token && Date.now() < exp;
        if (clienteUser && !assinaturaAtiva) {
          return false;
        }
        return base;
      }),
      distinctUntilChanged()
    );
  }

  */

  tokenExpirado(): boolean {
     return !this.obterTokenAcesso() || Date.now() > this.obterInstanteExpiracao();
     }

  possuiPermissao(permissao: string): boolean { 
    const alvo = (permissao || '').toUpperCase();
    return (this.obterPermissoes() || []).some(p => (p || '').toUpperCase() === alvo);
  }

  temAlgumaPermissao(permissoes: string[]): boolean {
    if (!Array.isArray(permissoes) || permissoes.length === 0) {
      return false;
    }
    return permissoes.some(p => this.possuiPermissao(p));
  }

  // Mantido para compatibilidade temporaria
  possuiPapel(papel: string): boolean {
    return this.possuiPermissao(papel);
  }

  isSuporte(): boolean {
    const rotulo = this.obterRotuloUsuario();
    return (rotulo || '').toUpperCase() === 'SUPORTE';
  }

  // Escritas
  definirSessaoAPartirDoJwt(resposta: JwtResponse): void {
    const token = resposta.accessToken ?? '';
    const expiraEm = Date.now() + (resposta.expiresIn ?? 0) * 1000;
    const permissoes = resposta.permissoes ?? resposta.roles ?? [];
    const rotulo = resposta.loggedUserLabel ?? null;
    this.definirSessao(token, permissoes, expiraEm);
    this.rotuloUsuario$.next(rotulo);
    // Mantemos o refresh no storage legado durante a transição
    // Não persistimos mais no storage; refresh fica a cargo do cookie HttpOnly
  }

  definirSessao(tokenAcesso: string, permissoes: string[], expiraEm: number): void {
    this.tokenAcesso$.next(tokenAcesso);
    this.permissoes$.next(permissoes || []);
    this.expiraEm$.next(expiraEm || 0);
    // Não persistimos mais no storage
  }

  limpar(): void {
    this.tokenAcesso$.next(null);
    this.permissoes$.next([]);
    this.expiraEm$.next(0);
    this.rotuloUsuario$.next(null);
    // Nada adicional a limpar além do estado em memória
  }
}
