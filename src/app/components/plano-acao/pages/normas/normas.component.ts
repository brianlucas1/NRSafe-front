import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';

import { PlanoAcaoService } from '../../services/plano-acao-service';
import { NormaResponseDTO } from '../../dtos/norma-response-dto';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { PlanoAcaoNormaResponseDTO } from '../../dtos/plano-acao-norma-reponse-dto';

@Component({
  selector: 'app-normas',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './normas.component.html',
  styleUrl: './normas.component.scss'
})
export class NormasComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private planoAcaoService = inject(PlanoAcaoService);

  filterForm!: FormGroup;

  idPlanoAcao!: number;

  loading = false;
  rows = 10;
  totalRecords = 0;
  sortField = 'criadoEm';  
  sortOrder: 1 | -1 = -1;

  listaNormas: NormaResponseDTO[] = [];
  listaPlanoAcaoNormas: PlanoAcaoNormaResponseDTO[] = [];

  totaisGerais: { totalInvestimento: number; totalMulta: number } | null = null;


  private lastLazyEvent: TableLazyLoadEvent = { first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder };

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('idPlanoAcao');
    this.idPlanoAcao = id ? Number(id) : NaN;
    this.criaForm();    
    this.buscaNormasPorIdPlanoAcao();
    await this.aplicarFiltros(); 
  }

  async aplicarFiltros() {
    this.lastLazyEvent = { first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder };
    await this.carregaPlanoAcaoNormas(this.lastLazyEvent);
    this.carregarTotaisGerais();
  }

  buscaNormasPorIdPlanoAcao(){
    this.planoAcaoService.buscaNormasPorIdPlanoAcao(this.idPlanoAcao).subscribe({
      next: (resp) => {
        this.listaNormas = resp ?? [];
      },
      error: (err) => {
        console.error('Erro ao buscar normas:', err);
        this.listaNormas = [];
      }
    });
  }

  async onLazyLoad(event: TableLazyLoadEvent) {
    this.lastLazyEvent = event;
    await this.carregaPlanoAcaoNormas(event);
    this.carregarTotaisGerais();
  }

  private carregarTotaisGerais() {
    if (this.listaPlanoAcaoNormas != null) {
      if (!this.totaisGerais) {
        this.totaisGerais = { totalInvestimento: 0, totalMulta: 0 };
      } else {
        this.totaisGerais.totalInvestimento = 0;
        this.totaisGerais.totalMulta = 0;
      }
      this.listaPlanoAcaoNormas.forEach(plano => {
        this.totaisGerais!.totalInvestimento += plano.investimento ?? 0;
        this.totaisGerais!.totalMulta += plano.multa ?? 0;
      });
    }
}

  criaForm() {
    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicio = new Date(fim); inicio.setDate(inicio.getDate() - 31);

    this.filterForm = this.fb.group({
      normaSelecionada: [null],   
      dtInicio: [inicio],
      dtFim: [fim],
    });
  }

  private async carregaPlanoAcaoNormas(event: TableLazyLoadEvent): Promise<void> {
    this.loading = true;
    const params = this.buildQueryParams(event);

    try {
      const resp = await firstValueFrom(this.planoAcaoService.buscaPlanoAcaoNormas(this.idPlanoAcao, params)
      );

      this.listaPlanoAcaoNormas = resp?.content ?? [];
      this.totalRecords = resp?.totalElements ?? 0;

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.listaNormas = [];
      this.totalRecords = 0;
    } finally {
      this.loading = false;
    }
  }

  /** Monta query params para o backend */
  private buildQueryParams(event: TableLazyLoadEvent) {
    const form = this.filterForm.value;

    // paginação
    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows));
    const size = event.rows ?? this.rows;

    // ordenação
    this.sortField = Array.isArray(event.sortField)
      ? event.sortField[0] ?? this.sortField
      : (event.sortField ?? this.sortField);

    const incoming = event.sortOrder ?? this.sortOrder;
    if (incoming === 1 || incoming === -1) {
      this.sortOrder = incoming;
    }

    // filtros
    const filtros = {
      normaId: form.normaId ?? null,
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

  // normaliza datas p/ UTC ISO e evita perdas por fuso
  private toStartOfDayIso(d: Date) {
    const nd = new Date(d); nd.setHours(0, 0, 0, 0); return nd.toISOString();
  }
  private toEndOfDayIso(d: Date) {
    const nd = new Date(d); nd.setHours(23, 59, 59, 999); return nd.toISOString();
  }

  limparFiltro(){

  }
}
