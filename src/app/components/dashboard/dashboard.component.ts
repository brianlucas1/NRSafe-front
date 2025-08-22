import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa-service';
import { MessageService } from 'primeng/api';
import { EmpresaResponseDTO } from '../../models/response/empresa-reponse-dto';
import { StandaloneImports } from '../../util/standalone-imports';
import { firstValueFrom } from 'rxjs';
import { GraficoImports } from '../../util/grafico-imports';

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

  tipoConsultaOptions = [
    { label: 'Por Visita', value: 'V' },
    { label: 'Por Inspeções', value: 'I' },
  ];

  filterForm!: FormGroup;
  listaEmpresas?: EmpresaResponseDTO[] = [];

  filtrosSelecionados: any = null;

  constructor(
    private fb: FormBuilder,
    private empService: EmpresaService,
    private msgService: MessageService,
  ) { }

  async ngOnInit() {
    this.criaForm();
    this.aplicarFiltros();
    await this.carregaEmpresas();
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
  }

  getTituloDash() {
    if (this.filterForm.value.tipoConsulta === 'I') {
      this.tituloDash = 'Inspeções';
    } else {
      this.tituloDash = 'Visitas';
    }
    return this.tituloDash;
  }
}
