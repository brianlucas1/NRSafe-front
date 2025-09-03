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

  limparFiltro(){
    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicio = new Date(fim); inicio.setDate(inicio.getDate() - 31);

    this.filterForm.reset({ empresaSelecionada: null, dtInicio: inicio, dtFim: fim });
    this.aplicarFiltros();
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
    this.router.navigate(['/plano-acao', 'visitas', row.idPlanoAcao, 'normas']);
  }
  

  limparFiltros() {
    this.filterForm.reset({ empresaSelecionada: null, dtInicio: null, dtFim: null });
    this.aplicarFiltros();
  }

  async onLazyLoad(event: TableLazyLoadEvent) {
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

    this.sortField = Array.isArray(event.sortField)
      ? event.sortField[0] ?? this.sortField
      : (event.sortField ?? this.sortField);

    const incoming = event.sortOrder ?? this.sortOrder; // pode vir null
    if (incoming === 1 || incoming === -1) {
      this.sortOrder = incoming;
    }

    const filtros = {
      idEmpresa: form.empresaSelecionada ?? null,
      dtInicio: form.dtInicio ? this.toStartOfDayIso(form.dtInicio) : null,
      dtFim: form.dtFim ? this.toEndOfDayIso(form.dtFim) : null
    };

    return {
      page,
      size,
      sort: `${this.sortField},${this.sortOrder === 1 ? 'asc' : 'desc'}`,
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

  // normaliza datas p/ evitar perda por fuso/horário
  private toStartOfDayIso(d: Date) {
    const nd = new Date(d); nd.setHours(0, 0, 0, 0); return nd.toISOString();
  }

  private toEndOfDayIso(d: Date) {
    const nd = new Date(d); nd.setHours(23, 59, 59, 999); return nd.toISOString();
  }

}
