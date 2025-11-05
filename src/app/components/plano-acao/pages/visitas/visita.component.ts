import { Component, OnInit, SimpleChanges } from '@angular/core';

import { MessageService } from 'primeng/api';
import { FormGroup, FormBuilder } from '@angular/forms';
import { async, firstValueFrom } from 'rxjs';

import { TableLazyLoadEvent } from 'primeng/table';
import { EmpresaService } from '../../../../../services/empresa-service';
import { PlanoAcaoResponseDTO } from '../../dtos/plano-acao-reponse-dto';
import { EmpresaResponseDTO } from '../../../../models/response/empresa-reponse-dto';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { PlanoAcaoService } from '../../services/plano-acao-service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanoAcaoContextService } from '../../services/plano-acao-context';

@Component({
  selector: 'app-visita',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './visita.component.html',
  styleUrl: './visita.component.scss',
  providers: [MessageService]
})
export class VisitasComponent implements OnInit {

  filterForm!: FormGroup;
  filtrosSelecionados: any = null;
  listaEmpresas?: EmpresaResponseDTO[] = [];
  listaPlanoAcao: PlanoAcaoResponseDTO[] = [];

  tiposPlano = [
  { label: 'Todos', value: null },
  { label: 'Norma', value: 'NORMA' },
  { label: 'CheckList', value: 'CHECKLIST' }
];

  loading = false;
  rows = 10;
  totalRecords = 0;
  sortField = 'dthrCriacao';
  sortOrder: 1 | -1 = -1;

  totalInvestimentoPagina = 0;
  totalMultaPagina = 0;

  totaisGerais: { totalInvestimento: number; totalMulta: number } | null = null;

  private lastLazyEvent: TableLazyLoadEvent = { first: 0, rows: this.rows };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private ctx: PlanoAcaoContextService,
    private empService: EmpresaService,
    private planoAcaoService: PlanoAcaoService,
    private msgService: MessageService,
  ) { }

  async ngOnInit() {
    this.criaForm();
    this.aplicarFiltros();
    await this.carregaEmpresas();
  }


  async aplicarFiltros() {
    this.lastLazyEvent = { first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder };
    await this.carregaPlanoAcao(this.lastLazyEvent);
    this.carregarTotaisGerais();
  }

  limparFiltro() {
    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicio = new Date(fim); inicio.setDate(inicio.getDate() - 31);

    this.filterForm.reset({ empresaSelecionada: null, dtInicio: inicio, dtFim: fim, tiposPlano: null });
    this.aplicarFiltros();
  }

  exportarCsvCompleto(){

    var listaIdPlanoAcao = new Array<number>();

    this.listaPlanoAcao.forEach(plano => {
      listaIdPlanoAcao.push(plano.idPlanoAcao);
    });

       this.planoAcaoService.exportarCsvCompleto(listaIdPlanoAcao)
      .subscribe(blob => {
        // Cria URL para download
        const url = window.URL.createObjectURL(blob);
        // Cria link temporário
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plano_acao.xlsx'; // ou .csv se backend retornar CSV
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, err => {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao exportar arquivo!' })        
      });
  }

  private carregarTotaisGerais() {
    if (this.listaPlanoAcao != null) {
      if (!this.totaisGerais) {
        this.totaisGerais = { totalInvestimento: 0, totalMulta: 0 };
      } else {
        this.totaisGerais.totalInvestimento = 0;
        this.totaisGerais.totalMulta = 0;
      }
      this.listaPlanoAcao.forEach(plano => {
        this.totaisGerais!.totalInvestimento += plano.investimento ?? 0;
        this.totaisGerais!.totalMulta += plano.multa ?? 0;
      });
    }
  }

  abrirNormas(row: { idPlanoAcao: number }) {
    this.ctx.setPlano(row.idPlanoAcao); // fallback
    this.router.navigate(
      ['/plano-acao', 'items'],
      { state: { idPlanoAcao: row.idPlanoAcao } }
    );
  }

  exportarCSV(row: any) {
    this.planoAcaoService.exportarCsvVisita(row.idPlanoAcao)
      .subscribe(blob => {
        // Cria URL para download
        const url = window.URL.createObjectURL(blob);
        // Cria link temporário
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plano_acao_normas.xlsx'; // ou .csv se backend retornar CSV
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, err => {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao exportar arquivo!' })        
      });
  }


  limparFiltros() {
    this.filterForm.reset({ empresaSelecionada: null, dtInicio: null, dtFim: null, tiposPlano: null });
    this.aplicarFiltros();
  }

  async onLazyLoad(event: TableLazyLoadEvent) {
    if (this.loading) return;
    this.lastLazyEvent = event;
    this.carregaPlanoAcao(event);
    this.carregarTotaisGerais();
  }

  criaForm() {
    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicio = new Date(fim); inicio.setDate(inicio.getDate() - 31);

    this.filterForm = this.fb.group({
      empresaSelecionada: [null],
      dtInicio: [inicio],
      tipoPlano: [null], 
      dtFim: [fim],
    });
  }

  private async carregaPlanoAcao(event: TableLazyLoadEvent): Promise<void> {
    this.loading = true;
    const params = this.buildQueryParams(event);

    try {
      const resp = await firstValueFrom(this.planoAcaoService.buscaPlanoAcaoPorfiltro(params));
      this.listaPlanoAcao = resp.content ?? [];
      this.totalRecords = resp.totalElements ?? 0;

      this.totalInvestimentoPagina = this.listaPlanoAcao
        .reduce((acc, r) => acc + (r.investimento ?? 0), 0);

      this.totalMultaPagina = this.listaPlanoAcao
        .reduce((acc, r) => acc + (r.multa ?? 0), 0);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      this.listaPlanoAcao = [];
      this.totalRecords = 0;
    } finally {
      this.loading = false;
    }
  }


  private buildQueryParams(event: TableLazyLoadEvent) {
    const form = this.filterForm.value;

    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows));
    const size = event.rows ?? this.rows;

    const uiSortField = Array.isArray(event.sortField)
      ? event.sortField[0] ?? this.sortField
      : (event.sortField ?? this.sortField);
    const effectiveSortField = this.mapSortField(uiSortField);

    const incoming = event.sortOrder ?? this.sortOrder; // pode vir null
    const effectiveSortOrder: 1 | -1 = (incoming === 1 || incoming === -1) ? incoming : this.sortOrder;

    const filtros = {
      idEmpresa: form.empresaSelecionada ?? null,
      // Envia LocalDateTime no horário local (sem Z) compatível com Java LocalDateTime
      dtInicio: form.dtInicio ? this.toLocalDate(form.dtInicio, false) : null,
      dtFim: form.dtFim ? this.toLocalDate(form.dtFim, true) : null,
      tipoPlano: form.tipoPlano ?? null,
    };

    return {
      page,
      size,
      // Usa valores efetivos sem mutar propriedades do template (evita onLazyLoad duplicado)
      sort: `${effectiveSortField},${effectiveSortOrder === 1 ? 'asc' : 'desc'}`,
      ...filtros
    };
  }

  async carregaEmpresas() {
    try {
      this.listaEmpresas = await firstValueFrom(this.empService.buscaTodasEmpresas());
    } catch (error: any) {
      this.msgService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error?.message || 'Falha ao carregar empresas'
      });
    }
  }


  // Mapeia nome do campo do UI -> backend
  private mapSortField(field?: string): string {
    const map: Record<string, string> = {
      totalMulta: 'multa',
      dtHrCriacao: 'dthrCriacao',
      dthrAtualizacao: 'dthrAtualizacao'
    };
    if (!field) return 'dthrCriacao';
    return map[field] ?? field;
  }

  // LocalDateTime (sem timezone) para Java: YYYY-MM-DDTHH:mm:ss
  private toLocalDate(d: Date, endOfDay: boolean): string {
    const nd = new Date(d);
    if (endOfDay) nd.setHours(23, 59, 59, 999); else nd.setHours(0, 0, 0, 0);
    const y = nd.getFullYear();
    const M = String(nd.getMonth() + 1).padStart(2, '0');
    const day = String(nd.getDate()).padStart(2, '0');
    return `${y}-${M}-${day}`;
  }

}
