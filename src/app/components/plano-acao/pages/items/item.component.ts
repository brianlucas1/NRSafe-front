import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';

import { Location } from '@angular/common';

import { PlanoAcaoService } from '../../services/plano-acao-service';
import { NormaResponseDTO } from '../../dtos/norma-response-dto';
import { StandaloneImports } from '../../../../util/standalone-imports';

import { normalizeStatus, PLANO_ACAO_STATUS_OPTIONS } from '../../dtos/status-plano-acao-enum-dto';
import { AngularSignaturePadModule, SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { AssinaturaPlanoAcaoRequestDTO } from '../../dtos/request/assinatura-plnao-acao-request-dto';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PlanoAcaoContextService } from '../../services/plano-acao-context';
import { PlanoAcaoItemResponseDTO } from '../../dtos/plano-acao-item-reponse-dto';
import { ArquivoDownloadService } from '../../../../util/arquivo-download';


@Component({
  selector: 'app-item',
  standalone: true,
  imports: [StandaloneImports, AngularSignaturePadModule,],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class ItemComponent implements OnInit {

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

  isAssinado = false;

  statusOptions = [...PLANO_ACAO_STATUS_OPTIONS];

  listaNormas: NormaResponseDTO[] = [];
  listaPlanoAcaoNormas: PlanoAcaoItemResponseDTO[] = [];

  totaisGerais: { totalInvestimento: number; totalMulta: number } | null = null;

  private lastLazyEvent: TableLazyLoadEvent = { first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder };

  constructor(
    private router: Router,
    private msgService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private location: Location,
    private ctx: PlanoAcaoContextService,
    private planoAcaoService: PlanoAcaoService,
    private arquivoDownload: ArquivoDownloadService,
  ) { }

  async ngOnInit(): Promise<void> {
    const fromNav = this.router.getCurrentNavigation()?.extras?.state as any;
    const idFromNav = fromNav?.idPlanoAcao;
    const idFromHist = (history.state as any)?.idPlanoAcao;

    const id = idFromNav ?? idFromHist ?? this.ctx.getPlano();
    if (!id) {
      this.router.navigate(['/plano-acao', 'visitas']);
      return;
    }

    this.idPlanoAcao = Number(id);
    this.ctx.setPlano(this.idPlanoAcao); // garante persistência pós-reload

    this.criaForm();
    this.buscaItemsPorIdPlanoAcao();
    await this.aplicarFiltros();

  }

  async aplicarFiltros() {
    this.lastLazyEvent = { first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder };
    await this.carregaPlanoAcaoItems(this.lastLazyEvent);
    this.carregarTotaisGerais();
  }

  private recomputaTodosConcluidos(): void {
    const items = this.listaPlanoAcaoNormas ?? [];
    this.normasConcluidas = items.length > 0 && items.every(it => normalizeStatus(it.status) === 'CO');
  }

  buscaItemsPorIdPlanoAcao() {
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

  desabilitarBotaoAssinar(): boolean {
    return this.isAssinado || !this.normasConcluidas;
  }

  assinarItems() {
    this.confirmationService.confirm(
      {
        message: 'Tem certeza de que assinar? Não será possivel alterar os itens do plano de ação após a assinatura.',
        header: 'Confirmação',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        acceptButtonStyleClass: 'p-button-success',
        rejectButtonStyleClass: 'p-button-danger',
        accept: async () => {
          this.dialogAssinatura = true;
        },
        reject: () => { }
      });
  }

  exportarCsvNormasCompleto() {

    var listaIdPlanoAcaoNorma = new Array<number>();

    this.listaPlanoAcaoNormas.forEach(plano => {
      listaIdPlanoAcaoNorma.push(plano.id);
    });

    this.planoAcaoService.exportarCsvNormasCompleto(listaIdPlanoAcaoNorma)
      .subscribe(blob => {
        this.arquivoDownload.baixar(blob, 'plano_acao_normas.xlsx');
      }, err => {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao exportar arquivo!' })
      });
  }


  exportarNormasComItens(idPlanoAcaoNorma: number) {
    this.planoAcaoService.exportarCsvNormasComInspecao(idPlanoAcaoNorma)
      .subscribe(blob => {
        this.arquivoDownload.baixar(blob, 'plano_acao_normas.xlsx');
      }, err => {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao exportar arquivo!' })
      });
  }

  salvaAssinatura() {
    if (this.pad.isEmpty()) return;

    const base64 = this.pad.toDataURL('image/png');

    const payload: AssinaturaPlanoAcaoRequestDTO = { dataUrlBase64: base64 };

    this.planoAcaoService.assinarNorma(this.idPlanoAcao, payload)
      .subscribe({
        next: () => {
          this.dialogAssinatura = false;
          this.msgService.add({ severity: 'success', summary: 'OK', detail: 'Assinatura salva e plano concluído.' });
          // recarregar lista/totais se necessário
          this.aplicarFiltros();
        },
        error: (err) => {
          this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar assinatura.' });
          console.error(err);
        }
      });
  }


  async onLazyLoad(event: TableLazyLoadEvent) {
    this.lastLazyEvent = event;
    await this.carregaPlanoAcaoItems(event);
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
        this.isAssinado = plano.statusPlanoAcao === 'AS';
        this.totaisGerais!.totalInvestimento += plano.investimento ?? 0;
        this.totaisGerais!.totalMulta += plano.multa ?? 0;
      });
    }
  }

  abrirInspecao(idPlanoAcaoNorma: number) {
    this.ctx.setPanr(idPlanoAcaoNorma); // fallback
    this.router.navigate(['/plano-acao', 'inspecoes'], { state: { idPlanoAcao: this.idPlanoAcao } }
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

  private async carregaPlanoAcaoItems(event: TableLazyLoadEvent): Promise<void> {
    this.loading = true;
    const params = this.buildQueryParams(event);

    try {
      const resp = await firstValueFrom(this.planoAcaoService.buscaPlanoAcaoItems(this.idPlanoAcao, params));

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

  voltar() {
    // se houver histórico, volta; senão, cai no fallback “seguro”
    if (window.history.length > 1) this.location.back();
    else this.router.navigate(['/plano-acao', 'visitas']);
  }
}
