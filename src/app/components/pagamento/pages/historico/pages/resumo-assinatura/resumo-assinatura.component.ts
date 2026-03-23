import { Component } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, startWith } from 'rxjs';
import { StandaloneImports } from '../../../../../../util/standalone-imports';
import { PagamentoHistoricoService } from '../../../../services/pagamento-historico.service';
import { ResumoAssinaturaResponseDTO } from '../../../../../../models/dtos/resumo-assinatura-response-dto';
import { LoggerService } from '../../../../../../../services/logger.service';

export interface ResumoAssinaturaViewModel {
  plano: string;
  statusAssinatura: string;
  statusCobranca: string;
  proximaCobranca: string;
  valor: string;
}

interface ResumoAssinaturaState {
  carregando: boolean;
  erro: string | null;
  resumo: ResumoAssinaturaViewModel | null;
}

@Component({
  selector: 'app-resumo-assinatura',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './resumo-assinatura.component.html',
  styleUrl: './resumo-assinatura.component.scss'
})
export class ResumoAssinaturaComponent {
  readonly resumoState$: Observable<ResumoAssinaturaState>;

  constructor(
    private readonly pagamentoHistoricoService: PagamentoHistoricoService,
    private readonly logger: LoggerService
  ) {
    this.resumoState$ = this.pagamentoHistoricoService.buscarResumoAssinatura().pipe(
      map((resumo): ResumoAssinaturaState => ({
        carregando: false,
        erro: null,
        resumo: this.mapResumoAssinatura(resumo)
      })),
      startWith({
        carregando: true,
        erro: null,
        resumo: null
      }),
      catchError((erro) => {
        this.logger.error('Falha ao carregar resumo da assinatura.', erro);
        return of({
          carregando: false,
          erro: 'Nao foi possivel carregar o resumo da assinatura.',
          resumo: null
        });
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  isStatusCritico(status: string): boolean {
    const statusNormalizado = (status || '').toLowerCase();
    return (
      statusNormalizado.includes('atras') ||
      statusNormalizado.includes('venc') ||
      statusNormalizado.includes('inadimpl') ||
      statusNormalizado.includes('pendente')
    );
  }

  private mapResumoAssinatura(resumo: ResumoAssinaturaResponseDTO): ResumoAssinaturaViewModel {
    return {
      plano: resumo.planoNome || '-',
      statusAssinatura: this.formatarTexto(resumo.statusAssinatura),
      statusCobranca: this.formatarTexto(resumo.statusCobranca),
      proximaCobranca: this.formatarData(resumo.dataProximaCobranca),
      valor: this.formatarValor(resumo.valor, resumo.tipoPlano)
    };
  }

  private formatarValor(valor: number, tipoPlano: string): string {
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor ?? 0);
    const periodo = this.formatarPeriodo(tipoPlano);

    return periodo ? `${valorFormatado} / ${periodo}` : valorFormatado;
  }

  private formatarPeriodo(tipoPlano: string): string {
    const tipoPlanoNormalizado = (tipoPlano || '').trim().toLowerCase();

    if (!tipoPlanoNormalizado) {
      return '';
    }

    if (tipoPlanoNormalizado.includes('mens')) {
      return 'Mes';
    }

    if (tipoPlanoNormalizado.includes('anu')) {
      return 'Ano';
    }

    return this.formatarTexto(tipoPlanoNormalizado);
  }

  private formatarData(dataIso: string): string {
    if (!dataIso) {
      return '-';
    }

    const [ano, mes, dia] = dataIso.split('-').map(Number);
    if (!ano || !mes || !dia) {
      return dataIso;
    }

    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(Date.UTC(ano, mes - 1, dia));
  }

  private formatarTexto(valor: string): string {
    if (!valor?.trim()) {
      return '-';
    }

    return valor
      .trim()
      .toLowerCase()
      .split(/[_\s]+/)
      .filter(Boolean)
      .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
      .join(' ');
  }
}
