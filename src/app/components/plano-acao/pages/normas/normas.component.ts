import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';

import { PlanoAcaoService } from '../../services/plano-acao-service';
import { NormaResponseDTO } from '../../dtos/norma-response-dto';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { PlanoAcaoNormaResponseDTO } from '../../dtos/plano-acao-norma-reponse-dto';
import { normalizeStatus, PLANO_ACAO_STATUS_OPTIONS } from '../../dtos/status-plano-acao-enum-dto';
import { AngularSignaturePadModule, SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { AssinaturaPlanoAcaoRequestDTO } from '../../dtos/request/assinatura-plnao-acao-request-dto';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-normas',
  standalone: true,
  imports: [StandaloneImports, AngularSignaturePadModule,],
  templateUrl: './normas.component.html',
  styleUrl: './normas.component.scss'
})
export class NormasComponent implements OnInit {

  @ViewChild('pad') pad!: SignaturePadComponent;
  @ViewChild('dialogContent') dialogContent!: ElementRef<HTMLDivElement>;

  filterForm!: FormGroup;

  idPlanoAcao!: number;

  dialogAssinatura = false;
  assinaturaBase64: string | null = null;

    // Use as opções suportadas pelo wrapper (sem mexer no DOM)
  options: any = {
    minWidth: 0.8,
    maxWidth: 2.5,
    penColor: '#000',
    backgroundColor: '#fff',
    canvasWidth: 500,   // será recalculado no onDialogShow
    canvasHeight: 220
  };

  loading = false;
  rows = 10;
  totalRecords = 0;
  sortField = 'criadoEm';
  sortOrder: 1 | -1 = -1;

  normasConcluidas = false;

  statusOptions = [...PLANO_ACAO_STATUS_OPTIONS];

  listaNormas: NormaResponseDTO[] = [];
  listaPlanoAcaoNormas: PlanoAcaoNormaResponseDTO[] = [];

  totaisGerais: { totalInvestimento: number; totalMulta: number } | null = null;

  private lastLazyEvent: TableLazyLoadEvent = { first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private msgService: MessageService,
    private fb: FormBuilder,
    private planoAcaoService: PlanoAcaoService,
  ) { }

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

  private recomputaTodosConcluidos(): void {
    const items = this.listaPlanoAcaoNormas ?? [];
    this.normasConcluidas =   items.length > 0 && items.every(it => normalizeStatus(it.status) === 'CO');
    console.log('Normas todas concluídas:', this.normasConcluidas);
  }

  buscaNormasPorIdPlanoAcao() {
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

  assinarNormas() {
    this.dialogAssinatura = true;
  }

  salvaAssinatura() {
  if (this.pad.isEmpty()) return;

  const base64 = this.pad.toDataURL('image/png');

  const payload: AssinaturaPlanoAcaoRequestDTO = { dataUrlBase64: base64 };

  this.planoAcaoService.assinarNorma(this.idPlanoAcao, payload)
    .subscribe({
      next: () => {
        this.dialogAssinatura = false;
        this.msgService.add({severity:'success', summary:'OK', detail:'Assinatura salva e plano concluído.'});
        // recarregar lista/totais se necessário
        this.aplicarFiltros();
      },
      error: (err) => {
        this.msgService.add({severity:'error', summary:'Erro', detail:'Falha ao salvar assinatura.'});
        console.error(err);
      }
    });
}


  async onLazyLoad(event: TableLazyLoadEvent) {
    this.lastLazyEvent = event;
    await this.carregaPlanoAcaoNormas(event);
    this.carregarTotaisGerais(); 
  }

  
  clear() {
    this.pad.clear();
    this.assinaturaBase64 = null;
  }

onDialogShow() {
  requestAnimationFrame(() => {
    const w = this.dialogContent?.nativeElement?.clientWidth ?? 500;

    // atualiza opções com largura real do container
    this.options = {
      ...this.options,
      canvasWidth: w,
      canvasHeight: 220
    };

    // alguns releases do wrapper expõem resizeCanvas()
    (this.pad as any)?.resizeCanvas?.();

    this.pad.clear();
  });
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

  abrirInspecao(row: { idPlanoAcaoNorma: number }) {
    this.router.navigate([row, 'itens'], { relativeTo: this.route }
    );
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
      const resp = await firstValueFrom(this.planoAcaoService.buscaPlanoAcaoNormas(this.idPlanoAcao, params));

      this.listaPlanoAcaoNormas = resp?.content ?? [];
      this.totalRecords = resp?.totalElements ?? 0;
      this.recomputaTodosConcluidos();

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

  limparFiltro() {

    this.criaForm();
    this.aplicarFiltros();


  }
}
