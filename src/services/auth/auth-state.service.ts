import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { AcaoPermissaoEnum } from '../../app/models/enums/acao-permissao-enum';
import { JwtResponse } from '../../app/models/jwt-response';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly tokenAcesso$ = new BehaviorSubject<string | null>(null);
  private readonly permissoes$ = new BehaviorSubject<string[]>([]);
  private readonly expiraEm$ = new BehaviorSubject<number>(0);
  private readonly rotuloUsuario$ = new BehaviorSubject<string | null>(null);
  private readonly clienteUser$ = new BehaviorSubject<boolean>(false);
  private readonly assinaturaAtiva$ = new BehaviorSubject<boolean>(true);

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

  obterClienteUser(): boolean {
    return this.clienteUser$.value;
  }

  obterAssinaturaAtiva(): boolean {
    return this.assinaturaAtiva$.value;
  }

  estaLogado(): boolean {
    const token = this.obterTokenAcesso();
    const exp = this.obterInstanteExpiracao();
    return !!token && Date.now() < exp;
  }

  observarAutenticado(): Observable<boolean> {
    return combineLatest([this.tokenAcesso$.asObservable(), this.expiraEm$.asObservable()]).pipe(
      map(([token, exp]) => !!token && Date.now() < exp),
      distinctUntilChanged()
    );
  }

  tokenExpirado(): boolean {
    return !this.obterTokenAcesso() || Date.now() > this.obterInstanteExpiracao();
  }

  possuiPermissao(permissao: string): boolean {
    const alvo = this.normalizarPermissao(permissao);
    if (!alvo) {
      return false;
    }
    return (this.obterPermissoes() || []).some((p) => this.normalizarPermissao(p) === alvo);
  }

  temAlgumaPermissao(permissoes: string[]): boolean {
    if (!Array.isArray(permissoes) || permissoes.length === 0) {
      return false;
    }
    return permissoes.some((p) => this.possuiPermissao(p));
  }

  possuiPapel(papel: string): boolean {
    return this.possuiPermissao(papel);
  }

  isSuporte(): boolean {
    return this.temAlgumaPermissao(['ROLE_SUPORTE', 'SUPORTE', 'ROLE_ADMIN', 'ADMIN']);
  }

  isCliente(): boolean {
    if (this.obterClienteUser()) {
      return true;
    }
    return this.temAlgumaPermissao(['ROLE_CLIENTE', 'CLIENTE']);
  }

  podeVisualizar(): boolean {
    return this.possuiPermissao(AcaoPermissaoEnum.VISUALIZAR);
  }

  podeSalvar(): boolean {
    return this.temAlgumaPermissao([AcaoPermissaoEnum.CADASTRAR, AcaoPermissaoEnum.EDITAR]);
  }

  podeInativarOuExcluir(): boolean {
    return this.possuiPermissao(AcaoPermissaoEnum.EXCLUIR);
  }

  podeBaixar(): boolean {
    return this.possuiPermissao(AcaoPermissaoEnum.BAIXAR);
  }

  podeGerenciarPermissoes(): boolean {
    return this.isSuporte() || (this.isCliente() && this.podeSalvar());
  }

  definirSessaoAPartirDoJwt(resposta: JwtResponse): void {
    const token = resposta.accessToken ?? '';
    const expiraEm = Date.now() + (resposta.expiresIn ?? 0) * 1000;
    const permissoes = this.normalizarPermissoes([
      ...(resposta.permissoes ?? []),
      ...(resposta.roles ?? [])
    ]);
    const rotulo = resposta.loggedUserLabel ?? null;
    const clienteUser = !!resposta.clienteUser;
    const assinaturaAtiva = resposta.assinaturaAtiva !== false;

    this.definirSessao(token, permissoes, expiraEm, clienteUser, assinaturaAtiva);
    this.rotuloUsuario$.next(rotulo);
  }

  definirSessao(
    tokenAcesso: string,
    permissoes: string[],
    expiraEm: number,
    clienteUser = false,
    assinaturaAtiva = true
  ): void {
    this.tokenAcesso$.next(tokenAcesso);
    this.permissoes$.next(this.normalizarPermissoes(permissoes || []));
    this.expiraEm$.next(expiraEm || 0);
    this.clienteUser$.next(!!clienteUser);
    this.assinaturaAtiva$.next(assinaturaAtiva !== false);
  }

  limpar(): void {
    this.tokenAcesso$.next(null);
    this.permissoes$.next([]);
    this.expiraEm$.next(0);
    this.rotuloUsuario$.next(null);
    this.clienteUser$.next(false);
    this.assinaturaAtiva$.next(true);
  }

  private normalizarPermissoes(permissoes: ReadonlyArray<string | null | undefined>): string[] {
    const normalizadas = permissoes
      .map((permissao) => this.normalizarPermissao(permissao))
      .filter((permissao) => !!permissao);
    return Array.from(new Set(normalizadas));
  }

  private normalizarPermissao(permissao: string | null | undefined): string {
    const valor = String(permissao ?? '').trim().toUpperCase();
    if (!valor) {
      return '';
    }
    if (valor === 'CONSULTAR') {
      return AcaoPermissaoEnum.VISUALIZAR;
    }
    return valor;
  }
}
