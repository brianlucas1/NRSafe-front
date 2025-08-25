import { Component, OnInit, SimpleChanges } from '@angular/core';
import { StandaloneImports } from '../../util/standalone-imports';
import { MessageService } from 'primeng/api';
import { FormGroup, FormBuilder } from '@angular/forms';
import { async, firstValueFrom } from 'rxjs';
import { EmpresaResponseDTO } from '../../models/response/empresa-reponse-dto';
import { EmpresaService } from '../../../services/empresa-service';
import { PlanoAcaoService } from '../../../services/plano-acao-service';
import { planoAcaoResponseDTO } from '../../models/dtos/plano-acao-reponse-dto';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-plano-acao',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './plano-acao.component.html',
  styleUrl: './plano-acao.component.scss',
  providers: [MessageService]
})
export class PlanoAcaoComponent implements OnInit {

  filterForm!: FormGroup;
  filtrosSelecionados: any = null;
  listaEmpresas?: EmpresaResponseDTO[] = [];
  listaPlanoAcao: planoAcaoResponseDTO[] = [];

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



  aplicarFiltros() {
    this.lastLazyEvent = { first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder };
    this.carregarTotaisGerais();     
    this.carregaPlanoAcao(this.lastLazyEvent);
  }

  private carregarTotaisGerais() {
  const f = this.filterForm.value;
  const filtros = {
    idEmpresa: f.empresaSelecionada ?? null,
    dtInicio: f.dtInicio ? this.toStartOfDayIso(f.dtInicio) : null,
    dtFim: f.dtFim ? this.toEndOfDayIso(f.dtFim) : null
  };

  this.planoAcaoService.buscaTotaisPlanos(filtros).subscribe({
    next: (t) => this.totaisGerais = t,
    error: () => this.totaisGerais = null
  });
}

  limparFiltros() {
    this.filterForm.reset({ empresaSelecionada: null, dtInicio: null, dtFim: null });
    this.aplicarFiltros();
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.lastLazyEvent = event;
    this.carregaPlanoAcao(event);
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

  private carregaPlanoAcao(event: TableLazyLoadEvent) {
    this.loading = true;
    const params = this.buildQueryParams(event);

    this.planoAcaoService.buscaPlanoAcaoPorfiltro(params).subscribe({
      next: (resp) => {
        // back deve retornar { content: planoAcaoResponseDTO[], totalElements: number }
        this.listaPlanoAcao = resp.content ?? [];
        this.totalRecords = resp.totalElements ?? 0;
        this.totalInvestimentoPagina = this.listaPlanoAcao
          .reduce((acc, r) => acc + (r.totalInvestimento ?? 0), 0);
        this.totalMultaPagina = this.listaPlanoAcao
          .reduce((acc, r) => acc + (r.totalMulta ?? 0), 0);

        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.listaPlanoAcao = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }


  private buildQueryParams(event: TableLazyLoadEvent) {
    const form = this.filterForm.value;

    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows));
    const size = event.rows ?? this.rows;

    // sortField pode ser undefined
    this.sortField = Array.isArray(event.sortField)
      ? event.sortField[0] ?? this.sortField
      : (event.sortField ?? this.sortField);

    // sortOrder pode ser 1 | -1 | 0 | null | undefined
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
