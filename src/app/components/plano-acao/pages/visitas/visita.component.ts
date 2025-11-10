import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { StandaloneImports } from '../../../../util/standalone-imports';
import { EmpresaService } from '../../../../../services/empresa-service';
import { PlanoAcaoService } from '../../services/plano-acao-service';
import { PlanoAcaoContextService } from '../../services/plano-acao-context';

import { EmpresaResponseDTO } from '../../../../models/response/empresa-reponse-dto';
import { PlanoAcaoResponseDTO } from '../../dtos/plano-acao-reponse-dto';
import { ArquivoDownloadService } from '../../../../util/arquivo-download';

type Ordem = 1 | -1;

interface Totais {
  totalInvestimento: number;
  totalMulta: number;
}

interface ParametrosConsulta {
  page: number;
  size: number;
  sort: string; // "campo,asc|desc"
  idEmpresa: number | null;
  dtInicio: string | null; // 'YYYY-MM-DD'
  dtFim: string | null;    // 'YYYY-MM-DD'
  tipoPlano: 'NORMA' | 'CHECKLIST' | null;
}

@Component({
  selector: 'app-visita', // mantém seu selector original
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './visita.component.html',
  styleUrls: ['./visita.component.scss'],
  providers: [MessageService]
})
export class VisitasComponent implements OnInit {

  // === Form e filtros (nomes alinhados ao HTML) ===
  filterForm!: FormGroup;

  // empresas é opcional para suportar empresas?.length no HTML
  empresas?: EmpresaResponseDTO[] = [];
  planos: PlanoAcaoResponseDTO[] = [];

  carregando = false;
  linhasPorPagina = 10;
  totalRegistros = 0;
  campoOrdenacao = 'dthrCriacao';
  ordem: Ordem = -1;

  totaisPagina: Totais = { totalInvestimento: 0, totalMulta: 0 };
  totaisGerais: Totais = { totalInvestimento: 0, totalMulta: 0 };

  // usado no HTML: [options]="tiposPlano"
 tiposPlano = [ { label: 'Todos', value: null }, { label: 'Norma', value: 'NORMA' }, { label: 'CheckList', value: 'CHECKLIST' } ];

  private ultimoEventoTabela: TableLazyLoadEvent = { first: 0, rows: this.linhasPorPagina };
  private static readonly DIAS_JANELA_PADRAO = 31;

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly contexto: PlanoAcaoContextService,
    private readonly empresaService: EmpresaService,
    private readonly planoAcaoService: PlanoAcaoService,
    private readonly mensagens: MessageService,
    private readonly arquivoDownload: ArquivoDownloadService,

  ) {}

  async ngOnInit(): Promise<void> {
    this.criarFormulario();
    await this.carregarEmpresas();
    await this.aplicarFiltros();
  }

  // -----------------------------
  // Filtros / pesquisa
  // -----------------------------
  async aplicarFiltros(): Promise<void> {
    this.ultimoEventoTabela = {
      first: 0,
      rows: this.linhasPorPagina,
      sortField: this.campoOrdenacao,
      sortOrder: this.ordem
    };
    await this.carregarPlanos(this.ultimoEventoTabela);
    this.recalcularTotaisGerais();
  }

  // manter compatibilidade: alguns templates antigos chamam limparFiltro
  limparFiltro(): void { this.resetarFiltros(); }
  limparFiltros(): void { this.resetarFiltros(); }

  private resetarFiltros(): void {
    const { inicio, fim } = this.definirJanelaDatasPadrao();
    this.filterForm.reset({
      empresaSelecionada: null,
      dtInicio: inicio,
      dtFim: fim,
      tipoPlano: null
    });
    void this.aplicarFiltros();
  }

  async onLazyLoad(evento: TableLazyLoadEvent): Promise<void> {
    if (this.carregando) return;
    this.ultimoEventoTabela = evento;
    await this.carregarPlanos(evento);
    this.recalcularTotaisGerais();
  }

  // -----------------------------
  // Exportações (mantém nomes do HTML)
  // -----------------------------
  exportarCsvCompleto(): void {
    void this.exportarPaginaComoPlanilha();
  }

  async exportarPaginaComoPlanilha(): Promise<void> {
    try {
      const ids = this.planos.map(p => p.idPlanoAcao);
      if (ids.length === 0) {
        this.mensagens.add({ severity: 'warn', summary: 'Atenção', detail: 'Nenhum plano na página para exportar.' });
        return;
      }
      const blob = await firstValueFrom(this.planoAcaoService.exportarCsvCompleto(ids));
      this.baixarArquivo(blob, 'plano_acao.xlsx');
    } catch {
      this.mensagens.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao exportar arquivo!' });
    }
  }

  // assinatura usada no seu HTML atual
  exportarCSV(row: { idPlanoAcao: number }): void {
    void this.exportarUmPlano(row.idPlanoAcao);
  }

  private async exportarUmPlano(idPlanoAcao: number): Promise<void> {
    try {
      const blob = await firstValueFrom(this.planoAcaoService.exportarCsvVisita(idPlanoAcao));
      this.baixarArquivo(blob, `plano_acao_${idPlanoAcao}.xlsx`);
    } catch {
      this.mensagens.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao exportar arquivo!' });
    }
  }

  // -----------------------------
  // Navegação (mantém nome do HTML)
  // -----------------------------
  abrirNormas(row: { idPlanoAcao: number }): void {
    this.contexto.setPlano(row.idPlanoAcao);
    this.router.navigate(['/plano-acao', 'items'], { state: { idPlanoAcao: row.idPlanoAcao } });
  }

  // -----------------------------
  // Carga de dados
  // -----------------------------
  private async carregarEmpresas(): Promise<void> {
    try {
      this.empresas = await firstValueFrom(this.empresaService.buscaTodasEmpresas());
    } catch (erro: any) {
      this.mensagens.add({
        severity: 'error',
        summary: 'Erro',
        detail: erro?.message ?? 'Falha ao carregar empresas'
      });
      this.empresas = [];
    }
  }

  private async carregarPlanos(evento: TableLazyLoadEvent): Promise<void> {
    this.carregando = true;
    const params = this.montarParametrosConsulta(evento);

    try {
      const resp = await firstValueFrom(this.planoAcaoService.buscaPlanoAcaoPorfiltro(params));
      this.planos = resp?.content ?? [];
      this.totalRegistros = resp?.totalElements ?? 0;

      this.totaisPagina = {
        totalInvestimento: this.planos.reduce((acc, p) => acc + (p.investimento ?? 0), 0),
        totalMulta: this.planos.reduce((acc, p) => acc + (p.multa ?? 0), 0)
      };
    } catch {
      this.planos = [];
      this.totalRegistros = 0;
      this.totaisPagina = { totalInvestimento: 0, totalMulta: 0 };
      this.mensagens.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os planos.' });
    } finally {
      this.carregando = false;
    }
  }

  // -----------------------------
  // Totais
  // -----------------------------
  private recalcularTotaisGerais(): void {
    const totais: Totais = { totalInvestimento: 0, totalMulta: 0 };
    for (const p of this.planos) {
      totais.totalInvestimento += p.investimento ?? 0;
      totais.totalMulta += p.multa ?? 0;
    }
    this.totaisGerais = totais;
  }

  // -----------------------------
  // Formulário / parâmetros
  // -----------------------------
  private criarFormulario(): void {
    const { inicio, fim } = this.definirJanelaDatasPadrao();

    // nomes batendo com o HTML: empresaSelecionada, dtInicio, dtFim, tipoPlano
    this.filterForm = this.fb.group({
      empresaSelecionada: [null],
      dtInicio: [inicio],
      dtFim: [fim],
      tipoPlano: [null], // 'NORMA' | 'CHECKLIST' | null
    });
  }

  private definirJanelaDatasPadrao(): { inicio: Date; fim: Date } {
    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicio = new Date(fim);
    inicio.setDate(inicio.getDate() - VisitasComponent.DIAS_JANELA_PADRAO);
    return { inicio, fim };
  }

  private montarParametrosConsulta(evento: TableLazyLoadEvent): ParametrosConsulta {
    const form = this.filterForm.value as {
      empresaSelecionada: number | null;
      dtInicio: Date | null;
      dtFim: Date | null;
      tipoPlano: 'NORMA' | 'CHECKLIST' | null;
    };

    const page = Math.floor((evento.first ?? 0) / (evento.rows ?? this.linhasPorPagina));
    const size = evento.rows ?? this.linhasPorPagina;

    const uiSortField = Array.isArray(evento.sortField)
      ? evento.sortField[0] ?? this.campoOrdenacao
      : evento.sortField ?? this.campoOrdenacao;

    const campoOrdenado = this.mapearCampoOrdenacao(uiSortField);

    const ordemBruta = evento.sortOrder ?? this.ordem;
    const ordemEfetiva: Ordem = (ordemBruta === 1 || ordemBruta === -1) ? ordemBruta : this.ordem;

    return {
      page,
      size,
      sort: `${campoOrdenado},${ordemEfetiva === 1 ? 'asc' : 'desc'}`,
      idEmpresa: form.empresaSelecionada ?? null,
      dtInicio: form.dtInicio ? this.formatarDataLocal(form.dtInicio, false) : null,
      dtFim: form.dtFim ? this.formatarDataLocal(form.dtFim, true) : null,
      tipoPlano: form.tipoPlano ?? null
    };
  }

  // -----------------------------
  // Utilitários
  // -----------------------------
  private mapearCampoOrdenacao(campo?: string): string {
    if (!campo) return 'dthrCriacao';
    const mapa: Record<string, string> = {
      totalMulta: 'multa',
      dtHrCriacao: 'dthrCriacao', // tolera variação
      dthrAtualizacao: 'dthrAtualizacao'
    };
    return mapa[campo] ?? campo;
  }

  /** Retorna 'YYYY-MM-DD' sem timezone, ajustando início/fim do dia. */
  private formatarDataLocal(data: Date, fimDoDia: boolean): string {
    const d = new Date(data);
    if (fimDoDia) d.setHours(23, 59, 59, 999); else d.setHours(0, 0, 0, 0);
    const y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${M}-${day}`;
  }

   private baixarArquivo(blob: Blob, nome: string): void {
    this.arquivoDownload.baixar(blob, nome);
  }
  // trackBy para *ngFor
  identificarPlano(_: number, p: PlanoAcaoResponseDTO): number {
    return p.idPlanoAcao;
  }
}
