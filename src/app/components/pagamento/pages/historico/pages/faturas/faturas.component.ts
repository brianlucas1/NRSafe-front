import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { StandaloneImports } from '../../../../../../util/standalone-imports';
import { PagamentoHistoricoService } from '../../../../services/pagamento-historico.service';
import { HistoricoFaturaResponseDTO } from '../../../../../../models/dtos/historico-fatura-response-dto';
import { LoggerService } from '../../../../../../../services/logger.service';

export interface FaturaHistoricoViewModel {
  vencimento: string;
  valor: string;
  status: string;
  emAtraso: boolean;
}

@Component({
  selector: 'app-faturas-historico',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './faturas.component.html',
  styleUrl: './faturas.component.scss',
  providers: [MessageService]
})
export class FaturasComponent implements OnInit, OnDestroy {
  faturas: FaturaHistoricoViewModel[] = [];
  erro: string | null = null;
  loading = false;
  rows = 5;
  totalRecords = 0;
  first = 0;
  abrindoCheckout = false;

  private carregamentoSub?: Subscription;
  private pagamentoSub?: Subscription;

  constructor(
    private readonly pagamentoHistoricoService: PagamentoHistoricoService,
    private readonly logger: LoggerService,
    private readonly messages: MessageService
  ) {}

  ngOnInit(): void {
    this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
  }

  ngOnDestroy(): void {
    this.carregamentoSub?.unsubscribe();
    this.pagamentoSub?.unsubscribe();
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

    this.carregamentoSub = this.pagamentoHistoricoService.buscarHistoricoFaturas(page, rows).subscribe({
      next: (response) => {
        this.faturas = response.content.map((fatura) => this.mapFatura(fatura));
        this.totalRecords = response.totalElements;
      },
      error: (erro) => {
        this.logger.error('Falha ao carregar historico de faturas.', erro);
        this.faturas = [];
        this.totalRecords = 0;
        this.erro = 'Nao foi possivel carregar as faturas.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  abrirPagamentoFaturaEmAtraso(): void {
    if (this.abrindoCheckout) {
      return;
    }

    this.abrindoCheckout = true;
    this.pagamentoSub?.unsubscribe();

    this.pagamentoSub = this.pagamentoHistoricoService.buscarLinkPagamentoFaturaEmAtraso().subscribe({
      next: (response) => {
        const linkPagamento = response?.linkPagamento?.trim();
        if (!linkPagamento) {
          this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Nao foi possivel iniciar o pagamento.' });
          return;
        }

        const opened = window.open(linkPagamento, '_blank', 'noopener');
        if (!opened) {
          this.messages.add({ severity: 'warn', summary: 'Atencao', detail: 'Permita pop-ups para abrir o pagamento.' });
          return;
        }

        this.messages.add({ severity: 'info', summary: 'Pagamento', detail: 'Abrindo pagamento em nova aba.' });
      },
      error: (erro) => {
        this.logger.error('Falha ao buscar link de pagamento da fatura em atraso.', erro);
        this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Nao foi possivel gerar o link de pagamento.' });
      },
      complete: () => {
        this.abrindoCheckout = false;
      }
    });
  }

  isStatusVencida(status: string): boolean {
    const statusNormalizado = (status || '').toLowerCase();
    return statusNormalizado.includes('venc') || statusNormalizado.includes('atras');
  }

  isAcaoPaga(emAtraso: boolean): boolean {
    return !emAtraso;
  }

  getStatusLabel(status: string): string {
    return this.formatarTexto(status);
  }

  private mapFatura(fatura: HistoricoFaturaResponseDTO): FaturaHistoricoViewModel {
    return {
      vencimento: this.formatarData(fatura.vencimento),
      valor: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(fatura.valor ?? 0),
      status: fatura.status,
      emAtraso: fatura.emAtraso
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
