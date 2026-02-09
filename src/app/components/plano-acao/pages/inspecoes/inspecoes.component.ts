import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PlanoAcaoService } from '../../services/plano-acao-service';

import { Location } from '@angular/common';
import { SubItensNormaDTO } from '../../dtos/itens-norma-dto';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { PlanoAcaoSubItemResponseDTO } from '../../dtos/plano-acao-sub-item-norma-dto';
import { TableLazyLoadEvent } from 'primeng/table';
import { firstValueFrom } from 'rxjs';
import { normalizeStatus, PLANO_ACAO_STATUS_OPTIONS } from '../../dtos/status-plano-acao-enum-dto';
import { AtualizaSubitemRequestDTO } from '../../dtos/request/atualiza-sub-item-request-dto';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PlanoAcaoContextService } from '../../services/plano-acao-context';
import { Router } from '@angular/router';
import { ArquivoDownloadService } from '../../../../util/arquivo-download';
import { formataDataDiaMesAno } from '../../../../util/data-java';

@Component({
  selector: 'app-inspecoes',
  imports: [StandaloneImports],
  standalone: true,
  templateUrl: './inspecoes.component.html',
  styleUrl: './inspecoes.component.scss',
  providers: [MessageService, ConfirmationService],
})

export class InspecoesComponent implements OnInit {


  private originalSnapshot = new Map<number, {
    status: string | null;
    responsavel: string | null;
    planoAcao: string | null;
    previsaoMs: number | null;
    investimento: number | null;
    multa: number | null;
  }>();
  saving = false;

  filterForm!: FormGroup;

  idPlanoAcao!: number;
  idPlanoAcaoNorma!: number;

  planoConcluido = false;

  listaSubItensNorma: SubItensNormaDTO[] = [];
  listaPlanoAcaoSubItems: PlanoAcaoSubItemResponseDTO[] = [];

  statusOptions = [...PLANO_ACAO_STATUS_OPTIONS];

  loading = false;
  rows = 50;
  totalRecords = 0;
  sortField = 'criadoEm';
  sortOrder: 1 | -1 = -1;

  totaisGerais: { totalInvestimento: number; totalMulta: number } | null = null;

  private lastLazyEvent: TableLazyLoadEvent = { first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private ctx: PlanoAcaoContextService,
    private confirmationService: ConfirmationService,
    private msgService: MessageService,
    private planoAcaoService: PlanoAcaoService,
    private arquivoDownload: ArquivoDownloadService) {
  }

  async ngOnInit(): Promise<void> {
    const fromNav = this.router.getCurrentNavigation()?.extras?.state as any;
    const idPlano = fromNav?.idPlanoAcao ?? (history.state as any)?.idPlanoAcao ?? this.ctx.getPlano();
    const idPanr = fromNav?.idPlanoAcaoNorma ?? (history.state as any)?.idPlanoAcaoNorma ?? this.ctx.getPanr();

    if (!idPlano || !idPanr) {
      this.router.navigate(['/plano-acao', 'visitas']);
      return;
    }

    this.idPlanoAcao = Number(idPlano);
    this.idPlanoAcaoNorma = Number(idPanr);
    this.ctx.setPlano(this.idPlanoAcao);


    this.criaForm();
    this.buscaSubItensNorma();
    await this.aplicarFiltros();
  }
  async salvarAlteracoes() {
    if (this.saving) return;

    const changes = this.getChanges();

    if (!this.validaCampos(changes)) return;
  
    this.saving = true;

    try {
      this.confirmationService.confirm(
        {
          message: 'Tem certeza de que deseja salvar realizar essas alterações?',
          header: 'Confirmação',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Sim',
          rejectLabel: 'Não',
          acceptButtonStyleClass: 'p-button-success',
          rejectButtonStyleClass: 'p-button-danger',
          accept: async () => {
            await firstValueFrom(this.planoAcaoService.atualizaPlanoAcaoSubItem(this.idPlanoAcaoNorma, changes));
            this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Alterações salvas com sucesso' });
            await this.carregaPlanoAcaoSubItensNormas(this.lastLazyEvent); this.carregarTotaisGerais();

          },
          reject: () => { }
        });
    } finally { this.saving = false; }
  }

  private validaCampos(changes: AtualizaSubitemRequestDTO[]): boolean {

    if(changes.length === 0) {
      this.msgService.add({ severity: 'info', summary: 'Atenção', detail: 'Nenhuma alteração para salvar' });
      return false;
    }

    for (const change of changes) {
      const row = this.listaPlanoAcaoSubItems.find(r => r?.id === change.id);
      if (!row) continue;

      if (!row.status) {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Para salvar é necessário selecionar um status' });
        return false;
      }

      // Regra de negócio: para concluir, exige campos completos
      if (row.status === 'CO' && !this.isRequiredFilled(row)) {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Para concluir é necessário preencher Plano de ação, Responsável e Previsão' });
        return false;
      }

      // CheckList: só permite salvar mudança de status se Multa > 0
      if (change.status !== undefined && this.isCheckListRow(row) && !this.isMultaOk(row)) {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Para alterar o status do CheckList, a Multa deve ser maior que R$ 0,00' });
        return false;
      }
    }
    return true;
  }


  exportarCsvItensCompleto() {

    var listaIdPlanoAcaoInspecao = new Array<number>();

    this.listaPlanoAcaoSubItems.forEach(plano => {
      listaIdPlanoAcaoInspecao.push(plano.id);
    });

    this.planoAcaoService.exportarCsvCompletoItens(listaIdPlanoAcaoInspecao)
      .subscribe(blob => {
        this.arquivoDownload.baixar(blob, 'plano_acao_normas.xlsx');
      }, err => {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao exportar arquivo!' })
      });
  }

  async onLazyLoad(event: TableLazyLoadEvent) {
    if (this.loading) return; // evita chamadas duplicadas enquanto carrega
    this.lastLazyEvent = event;
    await this.carregaPlanoAcaoSubItensNormas(event);
    this.carregarTotaisGerais();
  }

  async aplicarFiltros() {
    this.lastLazyEvent = { first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder };
    await this.carregaPlanoAcaoSubItensNormas(this.lastLazyEvent);
    this.carregarTotaisGerais();
  }

  private parseBackendDate(input: any): Date | null {
    if (!input) return null;
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

    if (typeof input === 'number') {
      const d = new Date(input);
      return isNaN(d.getTime()) ? null : d;
    }

    if (typeof input === 'string') {
      const s = input.trim();
      if (!s) return null;

      // dd-MM-yyyy ou dd/MM/yyyy
      const m = /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.exec(s);
      if (m) {
        const dd = Number(m[1]);
        const mm = Number(m[2]);
        const yyyy = Number(m[3]);
        const d = new Date(yyyy, mm - 1, dd);
        return isNaN(d.getTime()) ? null : d;
      }

      // ISO / RFC (yyyy-MM-dd, yyyy-MM-ddTHH:mm:ss, etc.)
      const iso = new Date(s);
      if (!isNaN(iso.getTime())) return iso;
    }

    return null;
  }

  private toDateMs(input: any): number | null {
    const d = this.parseBackendDate(input);
    return d ? d.getTime() : null;
  }

  private async carregaPlanoAcaoSubItensNormas(event: TableLazyLoadEvent): Promise<void> {
    this.loading = true;
    const params = this.buildQueryParams(event);

    try {
      const resp = await firstValueFrom(
        this.planoAcaoService.buscaPlanoAcaoInspecao(this.idPlanoAcaoNorma, params)
      );

      const content = resp?.content ?? [];

      this.listaPlanoAcaoSubItems = content.map((r: any) => ({      
        ...r,
        // garanta que os campos editáveis existam (null-safe)
        status: normalizeStatus(r.status) ?? r.status ?? null,
        previsao: this.parseBackendDate(r.previsao),
        responsavel: r.responsavel ?? null,
        planoAcao: r.planoAcao ?? null
      })
    );

      this.totalRecords = resp?.totalElements ?? 0;

      // snapshot só dos campos editáveis
      this.originalSnapshot.clear();
      for (const row of this.listaPlanoAcaoSubItems) {
        if (row?.id != null) {
          this.originalSnapshot.set(row.id, {
            status: row.status ?? null,
            investimento: row.investimento ?? null,
            previsaoMs: this.toDateMs(row.previsao),
            multa: row.multa ?? null,
            responsavel: row.responsavel ?? null,
            planoAcao: row.planoAcao ?? null
          });
        }
      }
    } catch (error) {
      console.error(error);
      this.listaPlanoAcaoSubItems = [];
      this.totalRecords = 0;
    } finally {
      this.loading = false;
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

  buscaSubItensNorma() {
    this.planoAcaoService.buscaSubItensNorma(this.idPlanoAcaoNorma).subscribe({
      next: (res) => {
        this.listaSubItensNorma = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  private buildQueryParams(event: TableLazyLoadEvent) {
    const form = this.filterForm.value;
    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows));
    const size = event.rows ?? this.rows;
    this.sortField = Array.isArray(event.sortField) ? (event.sortField[0] ?? this.sortField) : (event.sortField ?? this.sortField);
    const incoming = event.sortOrder ?? this.sortOrder;
    if (incoming === 1 || incoming === -1) this.sortOrder = incoming;

    return {
      page, size,
      sort: `${this.mapSortField(this.sortField)},${this.sortOrder === 1 ? 'asc' : 'desc'}`,
      subItemId: form.normaSelecionada ?? null,
      dtInicio: form.dtInicio ? formataDataDiaMesAno(form.dtInicio, false) : null,
      dtFim: form.dtFim ? formataDataDiaMesAno(form.dtFim, true) : null
    };
  }

  private mapSortField(field?: string): string {
    if (!field) return this.sortField;
    const map: Record<string, string> = {
      totalMulta: 'multa',
      totalInvestimento: 'investimento',
      descricao: 'descSubItem',
      // demais campos iguais ao backend
      planoAcao: 'planoAcao',
      responsavel: 'responsavel',
      previsao: 'previsao',
      status: 'status',
      norma: 'norma'
    };
    return map[field] ?? field;
  }

  // datas agora centralizadas em util/data-java.ts

  private carregarTotaisGerais() {
    if (this.listaPlanoAcaoSubItems != null) {
      if (!this.totaisGerais) {
        this.totaisGerais = { totalInvestimento: 0, totalMulta: 0 };
      } else {
        this.totaisGerais.totalInvestimento = 0;
        this.totaisGerais.totalMulta = 0;
      }
      this.planoConcluido = this.listaPlanoAcaoSubItems.length > 0
        && this.listaPlanoAcaoSubItems.every(plano => plano.statusPlanoAcao === 'CO');

      this.listaPlanoAcaoSubItems.forEach(plano => {
        this.totaisGerais!.totalInvestimento += plano.investimento ?? 0;
        this.totaisGerais!.totalMulta += plano.multa ?? 0;
      });
    }
  }

  limparFiltro() {

    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicio = new Date(fim); inicio.setDate(inicio.getDate() - 31);

    this.filterForm.patchValue({
      normaSelecionada: null,
      dtInicio: inicio,
      dtFim: fim
    }, { emitEvent: false });
    this.aplicarFiltros();
  }

  private getChanges(): AtualizaSubitemRequestDTO[] {

    const changes: AtualizaSubitemRequestDTO[] = [];

    for (const row of this.listaPlanoAcaoSubItems ?? []) {
      if (row?.id == null) continue;

      const orig = this.originalSnapshot.get(row.id) ?? { status: null, responsavel: null, planoAcao: null, previsaoMs: null, investimento: null, multa: null };
      const curPrevisaoDate = this.parseBackendDate(row.previsao);
      const cur = {
        investimento: row.investimento ?? null,
        status: row.status ?? null,
        multa: row.multa ?? null,
        previsaoMs: curPrevisaoDate ? curPrevisaoDate.getTime() : null,
        responsavel: row.responsavel ?? null,
        planoAcao: row.planoAcao ?? null
      };

      const diff: AtualizaSubitemRequestDTO = { id: row.id };
      let changed = false;

      if (orig.status !== cur.status) { diff.status = cur.status; changed = true; }
      if ((orig.responsavel || null) !== (cur.responsavel || null)) { diff.responsavel = cur.responsavel; changed = true; }
      if ((orig.planoAcao || null) !== (cur.planoAcao || null)) { diff.planoAcao = cur.planoAcao; changed = true; }
      if (orig.multa !== cur.multa) { diff.multa = cur.multa; changed = true; }
      if ((orig.previsaoMs || null) !== (cur.previsaoMs || null)) {
        diff.previsao = curPrevisaoDate ? formataDataDiaMesAno(curPrevisaoDate, false) : null;
        changed = true;
      }
      if (orig.investimento !== cur.investimento) { diff.investimento = cur.investimento; changed = true; }
      if (changed) changes.push(diff);
    }
    return changes;
  }

  voltar() {
    // se houver histórico, volta; senão, cai no fallback “seguro”
    if (window.history.length > 1) this.location.back();
    else this.router.navigate(['/plano-acao', 'normas']);
  }


  // Campos obrigatórios por regra de negócio
  private isRequiredFilled(row: PlanoAcaoSubItemResponseDTO): boolean {
    const hasPlano = !!row.planoAcao?.trim();
    const hasResp = !!row.responsavel?.trim();
    const hasPrev = !!this.parseBackendDate(row.previsao);
    return hasPlano && hasResp && hasPrev;
  }

  // A regra pede "alterar o status": status deve ser diferente do snapshot (ou definido se estava null)
  private isStatusChanged(row: PlanoAcaoSubItemResponseDTO): boolean {
    const orig = this.originalSnapshot.get(row.id);
    if (!orig) return !!row.status;
    return (orig.status ?? null) !== (row.status ?? null);
  }

  private isCheckListRow(row: PlanoAcaoSubItemResponseDTO): boolean {
    return !!row.descCheckListPergunta;
  }

  private isMultaOk(row: PlanoAcaoSubItemResponseDTO): boolean {
    return (row.multa ?? 0) > 0;
  }

  isMultaInvalid(row: PlanoAcaoSubItemResponseDTO): boolean {
    const changed = this.rowHasAnyChange(row);
    if (!changed) return false;
    // só marca quando o usuário mudou o status do CheckList
    return this.isCheckListRow(row) && this.isStatusChanged(row) && !this.isMultaOk(row);
  }

  // Para pintar o campo como inválido no template
  isFieldInvalid(row: PlanoAcaoSubItemResponseDTO, field: 'planoAcao' | 'responsavel' | 'previsao' | 'status'): boolean {
    const changed = this.rowHasAnyChange(row);
    if (!changed) return false; // só valida o que será salvo

    const requiresAll = (row.status ?? null) === 'CO';
    switch (field) {
      case 'planoAcao': return requiresAll && !row.planoAcao?.trim();
      case 'responsavel': return requiresAll && !row.responsavel?.trim();
      case 'previsao': return requiresAll && !this.parseBackendDate(row.previsao);
      case 'status': return !row.status;
    }
  }

  private rowHasAnyChange(row: PlanoAcaoSubItemResponseDTO): boolean {
    const o = this.originalSnapshot.get(row.id);
    if (!o) return true;
    const curPrevisaoMs = this.toDateMs(row.previsao);
    return (o.status ?? null) !== (row.status ?? null)
      || (o.responsavel ?? null) !== (row.responsavel ?? null)
      || (o.planoAcao ?? null) !== (row.planoAcao ?? null)
      || (o.previsaoMs ?? null) !== (curPrevisaoMs ?? null)
      || (o.investimento ?? null) !== (row.investimento ?? null)
      || (o.multa ?? null) !== (row.multa ?? null);
  }



}
