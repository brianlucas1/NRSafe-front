import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AcaoPermissaoEnum } from '../models/enums/acao-permissao-enum';
import { AuthStateService } from '../../services/auth/auth-state.service';

export const PERMISSAO_TOAST_KEY = 'auth-permissao';

export interface PermissaoRequisicaoResolvida {
  permissoes: AcaoPermissaoEnum[];
  acao: string;
}

@Injectable({ providedIn: 'root' })
export class PermissaoHelperService {
  private static readonly DOWNLOAD_MARKERS = ['download', 'baixar', 'csv', 'export', 'expotar', 'xlsx'];
  private static readonly INATIVACAO_MARKERS = ['inativar', 'inativacao', 'desvincular', 'alternar-ativo'];

  constructor(
    private readonly authState: AuthStateService,
    private readonly messageService: MessageService
  ) {}

  normalizarPermissoes(permissoes: ReadonlyArray<string | null | undefined>): string[] {
    const normalizadas = permissoes
      .map((permissao) => this.normalizarPermissao(permissao))
      .filter((permissao) => !!permissao);
    return Array.from(new Set(normalizadas));
  }

  validarAcaoOuAvisar(
    permissoesNecessarias: ReadonlyArray<string>,
    acaoDescricao: string,
    detalhe?: string
  ): boolean {
    const permissoesNormalizadas = this.normalizarPermissoes(permissoesNecessarias);
    const permitido = this.authState.temAlgumaPermissao(permissoesNormalizadas);
    if (!permitido) {
      this.messageService.add({
        key: PERMISSAO_TOAST_KEY,
        severity: 'warn',
        summary: 'Sem permissao',
        detail: detalhe ?? `Voce nao tem permissao para ${acaoDescricao}.`
      });
    }
    return permitido;
  }

  resolverPermissaoDaRequisicao(method: string, url: string): PermissaoRequisicaoResolvida | null {
    const metodo = (method || '').trim().toUpperCase();
    const urlNormalizada = (url || '').toLowerCase();

    if (metodo === 'GET') {
      if (this.contemAlgum(urlNormalizada, PermissaoHelperService.DOWNLOAD_MARKERS)) {
        return { permissoes: [AcaoPermissaoEnum.BAIXAR], acao: 'baixar arquivos' };
      }
      return { permissoes: [AcaoPermissaoEnum.VISUALIZAR], acao: 'visualizar dados' };
    }

    if (metodo === 'DELETE') {
      return { permissoes: [AcaoPermissaoEnum.EXCLUIR], acao: 'inativar ou excluir registros' };
    }

    if (metodo === 'POST' || metodo === 'PUT' || metodo === 'PATCH') {
      if (this.contemAlgum(urlNormalizada, PermissaoHelperService.DOWNLOAD_MARKERS)) {
        return { permissoes: [AcaoPermissaoEnum.BAIXAR], acao: 'baixar arquivos' };
      }
      if (this.contemAlgum(urlNormalizada, PermissaoHelperService.INATIVACAO_MARKERS)) {
        return { permissoes: [AcaoPermissaoEnum.EXCLUIR], acao: 'inativar ou excluir registros' };
      }
      return { permissoes: [AcaoPermissaoEnum.CADASTRAR, AcaoPermissaoEnum.EDITAR], acao: 'salvar alteracoes' };
    }

    return null;
  }

  validarRequisicaoOuAvisar(method: string, url: string): boolean {
    const regra = this.resolverPermissaoDaRequisicao(method, url);
    if (!regra) {
      return true;
    }
    return this.validarAcaoOuAvisar(regra.permissoes, regra.acao);
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

  private contemAlgum(valor: string, termos: ReadonlyArray<string>): boolean {
    return termos.some((termo) => valor.includes(termo));
  }
}
