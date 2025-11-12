import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa-service';
import { MessageService } from 'primeng/api';
import { EmpresaResponseDTO } from '../../models/response/empresa-reponse-dto';
import { StandaloneImports } from '../../util/standalone-imports';
import { firstValueFrom } from 'rxjs';
import { GraficoImports } from '../../util/grafico-imports';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import { DashBoardService } from '../../../services/dash-board-service';
import { ResumoDashboardDTO } from '../../models/dtos/resumo-dashboard-dto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [StandaloneImports, GraficoImports],
  styleUrls: ['./dashboard.component.scss'],
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {

  tituloDash = 'Visitas';
  isAdmin = false;

  tipoConsultaOptions = [
    { label: 'Por Visita', value: 'V' },
    { label: 'Por Inspeções', value: 'I' },
  ];

  filterForm!: FormGroup;
  listaEmpresas?: EmpresaResponseDTO[] = [];

  filtrosSelecionados: any = null;

  resumo: ResumoDashboardDTO = {
    totalMulta: 0,
    totalInvestimento: 0,
    totalPerguntasRespondidas: 0,
  };


  constructor(
    private fb: FormBuilder,
    private empService: EmpresaService,
    private msgService: MessageService,
    private authState: AuthStateService,
    private dashService: DashBoardService,
  ) { }

  async ngOnInit() {
    this.isAdmin = this.authState.isSuporte();
    this.criaForm();
    if (!this.isAdmin) {
      this.aplicarFiltros();
      await this.carregaEmpresas();
    }
  }

  criaForm() {
    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    // início = fim - 31 dias
    const inicio = new Date(fim);
    inicio.setDate(inicio.getDate() - 31);

    this.filterForm = this.fb.group({
      empresaSelecionada: [null],
      dtInicio: [inicio],
      dtFim: [fim],
      tipoConsulta: [null],
    });
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

  aplicarFiltros() {
    const form = this.filterForm.value;

    const filtros = {
      idFilial: form.filialSelecionada ?? null,
      tipoConsulta: form.tipoConsulta ?? null,
      idSite: form.siteSelecionado ?? null,
      idEmpresa: form.empresaSelecionada ?? null,
      dtInicio: form.dtInicio ? form.dtInicio.toISOString() : null,
      dtFim: form.dtFim ? form.dtFim.toISOString() : null
    };
    this.filtrosSelecionados = filtros;
    this.carregaResumo();
  }

  getTituloDash() {
    if (this.filterForm.value.tipoConsulta === 'I') {
      this.tituloDash = 'Inspeções';
    } else {
      this.tituloDash = 'Visitas';
    }
    return this.tituloDash;
  }

  private carregaResumo() {
    if (!this.filtrosSelecionados) {
      return;
    }
    this.dashService.buscaResumoFinanceiroPorFiltro({
      ...this.filtrosSelecionados,
      tipoConsulta: this.filterForm.value?.tipoConsulta ?? null
    }).subscribe({
      next: (res) => this.resumo = res,
      error: (err) => {
        console.error('Erro ao carregar resumo:', err);
      }
    });
  }
}
