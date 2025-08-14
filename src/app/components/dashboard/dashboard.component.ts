import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DashBoardService } from '../../../services/dash-board-service';
import { EmpresaService } from '../../../services/empresa-service';
import { MessageService } from 'primeng/api';
import { EmpresaResponseDTO } from '../../models/response/empresa-reponse-dto';
import { StandaloneImports } from '../../util/standalone-imports';
import { DashboardTortaComponent } from './dashboard-torta/dashboard-torta.component';
import { firstValueFrom } from 'rxjs';
import { DashboardGraficoComponent } from './dashboard-grafico/dashboard-grafico.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [StandaloneImports, DashboardTortaComponent,DashboardGraficoComponent],
  styleUrls: ['./dashboard.component.scss'],
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {

  filterForm!: FormGroup;
  listaEmpresas?: EmpresaResponseDTO[] = [];

  filtrosSelecionados: any = null;

  constructor(
    private fb: FormBuilder,
    private dashService: DashBoardService,
    private empService: EmpresaService,
    private msgService: MessageService,

  ) { }

  async ngOnInit() {
    this.criaForm();
    await this.carregaEmpresas();
    this.aplicarFiltros();
  }

  criaForm() {
    this.filterForm = this.fb.group({
      empresaSelecionada: [null],
      dtInicio: [null],
      dtFim: [null]
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
      idSite: form.siteSelecionado ?? null,
      idEmpresa: form.empresaSelecionada ?? null,
      dtInicio: form.dtInicio ? form.dtInicio.toISOString() : null,
      dtFim: form.dtFim ? form.dtFim.toISOString() : null
    };
    this.filtrosSelecionados = filtros;
  }

}
