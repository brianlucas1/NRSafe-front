import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { StandaloneImports } from '../../../../../../util/standalone-imports';
import { PagamentoHistoricoService } from '../../../../services/pagamento-historico.service';
import { AtividadeContaResponseDTO } from '../../../../../../models/dtos/atividade-conta-response-dto';
import { LoggerService } from '../../../../../../../services/logger.service';

export interface AtividadeContaViewModel {
  data: string;
  hora: string;
  evento: string;
  titulo: string;
  descricao: string;
  detalhePrincipal: string;
  detalheSecundario?: string;
}

@Component({
  selector: 'app-atividade-conta',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './atividade-conta.component.html',
  styleUrl: './atividade-conta.component.scss'
})
export class AtividadeContaComponent implements OnInit, OnDestroy {
  atividades: AtividadeContaViewModel[] = [];
  erro: string | null = null;
  loading = false;
  rows = 4;
  totalRecords = 0;
  first = 0;

  private carregamentoSub?: Subscription;

  constructor(
    private readonly pagamentoHistoricoService: PagamentoHistoricoService,
    private readonly logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
  }

  ngOnDestroy(): void {
    this.carregamentoSub?.unsubscribe();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = Number(event.first ?? 0);
    const rows = Number(event.rows ?? this.rows);
    const page = Math.floor(first / rows);

    this.first = first;
    this.rows = rows;
    this.loading = true;
    this.erro = null;
    this.carregamentoSub?.unsubscribe();

    this.carregamentoSub = this.pagamentoHistoricoService.buscarAtividadesConta(page, rows).subscribe({
      next: (response) => {
        this.atividades = response.content.map((atividade) => this.mapAtividade(atividade));
        this.totalRecords = response.totalElements;
      },
      error: (erro) => {
        this.logger.error('Falha ao carregar atividades da conta.', erro);
        this.atividades = [];
        this.totalRecords = 0;
        this.erro = 'Nao foi possivel carregar as atividades da conta.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private mapAtividade(atividade: AtividadeContaResponseDTO): AtividadeContaViewModel {
    const dataEvento = this.parseLocalDateTime(atividade.dataEvento);
    const detalhePrincipal = this.montarDetalhePrincipal(atividade);
    const detalheSecundario = this.montarDetalheSecundario(atividade, detalhePrincipal);

    return {
      data: this.formatarDataHora(dataEvento).data,
      hora: this.formatarDataHora(dataEvento).hora,
      evento: atividade.evento || this.formatarTexto(atividade.tipoRegistro),
      titulo: this.formatarTexto(atividade.tipoEvento || atividade.tipoRegistro),
      descricao: atividade.descricao || '-',
      detalhePrincipal,
      detalheSecundario
    };
  }

  private montarDetalhePrincipal(atividade: AtividadeContaResponseDTO): string {
    if (atividade.detalhes?.trim()) {
      return atividade.detalhes.trim();
    }

    if (atividade.planoNome?.trim()) {
      return atividade.planoNome.trim();
    }

    if (atividade.valor !== null && atividade.valor !== undefined) {
      return this.formatarMoeda(atividade.valor);
    }

    return '-';
  }

  private montarDetalheSecundario(atividade: AtividadeContaResponseDTO, detalhePrincipal: string): string | undefined {
    const itens: string[] = [];

    if (atividade.planoNome?.trim() && atividade.planoNome.trim() !== detalhePrincipal) {
      itens.push(atividade.planoNome.trim());
    }

    if ((atividade.valor !== null && atividade.valor !== undefined) && this.formatarMoeda(atividade.valor) !== detalhePrincipal) {
      itens.push(this.formatarMoeda(atividade.valor));
    }

    if (atividade.status?.trim()) {
      itens.push(this.formatarTexto(atividade.status));
    }

    if (atividade.billingCycle?.trim()) {
      itens.push(this.formatarTexto(atividade.billingCycle));
    }

    if (atividade.dataVencimento) {
      itens.push(`Venc. ${this.formatarData(atividade.dataVencimento)}`);
    }

    return itens.length ? itens.join(' | ') : undefined;
  }

  private parseLocalDateTime(dataEvento: string): Date | null {
    if (!dataEvento) {
      return null;
    }

    const dataNormalizada = dataEvento.length === 16 ? `${dataEvento}:00` : dataEvento;
    const data = new Date(dataNormalizada);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  private formatarDataHora(data: Date | null): { data: string; hora: string } {
    if (!data) {
      return { data: '-', hora: '-' };
    }

    return {
      data: new Intl.DateTimeFormat('pt-BR').format(data),
      hora: new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(data)
    };
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

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor ?? 0);
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
