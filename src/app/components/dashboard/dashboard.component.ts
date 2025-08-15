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
import { DadosTabelaVisitaDTO } from '../../models/dtos/visita-grafico-empresa-dto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [StandaloneImports, DashboardTortaComponent,DashboardGraficoComponent],
  styleUrls: ['./dashboard.component.scss'],
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {

  graficoEmpresa: DadosTabelaVisitaDTO[] = [];
  filterForm!: FormGroup;
  listaEmpresas?: EmpresaResponseDTO[] = [];

  datas: string[] = []; 

  filtrosSelecionados: any = null;

  constructor(
    private fb: FormBuilder,
    private empService: EmpresaService,
    private msgService: MessageService,
    private dashService: DashBoardService,
  ) { }

  async ngOnInit() {
    this.criaForm();
    await this.carregaEmpresas();
    this.aplicarFiltros();
    this.carregaTabela();
  }

  criaForm() {
    this.filterForm = this.fb.group({
      empresaSelecionada: [null],
      dtInicio: [null],
      dtFim: [null]
    });
  }

  carregaTabela(){
    this.dashService.buscaDadosTabelaVisita(this.filtrosSelecionados).subscribe({
      next: (result) => {
         this.graficoEmpresa = result;

      // Gerar lista de datas únicas para colunas
      const setDatas = new Set<string>();
      this.graficoEmpresa.forEach(e => Object.keys(e.totais).forEach(d => setDatas.add(d)));
      this.datas = Array.from(setDatas).sort((a, b) => new Date(a.split('-').reverse().join('-')).getTime() - new Date(b.split('-').reverse().join('-')).getTime());
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
      }
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
    this.carregaTabela();
  }

}
