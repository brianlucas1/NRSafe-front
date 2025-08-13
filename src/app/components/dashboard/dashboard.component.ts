import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DashBoardService } from '../../../services/dash-board-service';
import { EmpresaService } from '../../../services/empresa-service';
import { MessageService } from 'primeng/api';
import { VisitaPercentualDashDTO } from '../../models/dtos/visita-percentual-dash-dto';
import { VisitaStatusLabel } from '../../models/dtos/visita-status-label-dto';
import { VisitaStatusEnum } from '../../models/enums/visita-status-enum';
import { ChartData, ChartOptions } from 'chart.js';
import { EmpresaResponseDTO } from '../../models/response/empresa-reponse-dto';
import { StandaloneImports } from '../../util/standalone-imports';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: StandaloneImports,
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {

  filterForm!: FormGroup;
  listaEmpresas?: EmpresaResponseDTO[] = [];

  chartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  chartOptions!: ChartOptions<'pie'>;
  centerTextPlugin: any;

  constructor(
    private fb: FormBuilder,
    private dashService: DashBoardService,
    private empService: EmpresaService,
    private msgService: MessageService,
    private cd: ChangeDetectorRef
  ) {
    // Plugin para desenhar o total no centro
    this.centerTextPlugin = {
      id: 'centerText',
      beforeDraw: (chart: any) => {
        if (!chart.data || !chart.data.datasets || !chart.data.datasets[0]) return;

        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
        ctx.restore();

        const fontSize = (height / 114).toFixed(2);
        ctx.font = fontSize + "em sans-serif";
        ctx.textBaseline = "middle";

        const total = chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
        const text = total.toString();
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;

        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    };
  }

  async ngOnInit() {
    this.criaForm();
    await this.carregaEmpresas();
    this.buscaDadosVisitaPercentual();
  }

  criaForm() {
    this.filterForm = this.fb.group({
      empresaSelecionada: [null],
      dtInicio: [null],
      dtFim: [null]
    });

    // Atualiza o gráfico ao mudar filtros
    this.filterForm.valueChanges.subscribe(() => this.buscaDadosVisitaPercentual());
  }

  async carregaEmpresas() {
    try {
      this.listaEmpresas = await this.empService.buscaTodasEmpresas().toPromise();
      this.cd.markForCheck();
    } catch (error: any) {
      this.msgService.add({ severity: 'error', summary: 'Erro', detail: error?.message || 'Falha ao carregar empresas' });
    }
  }

  buscaDadosVisitaPercentual() {
    const form = this.filterForm.value;
    const filtros = {
      idFilial: form.filialSelecionada ?? null,
      idSite: form.siteSelecionado ?? null,
      empresaIds: form.empresaSelecionada ?? null,
      dataInicio: form.dtInicio ? form.dtInicio.toISOString() : null,
      dataFim: form.dtFim ? form.dtFim.toISOString() : null
    };

    this.dashService.buscaDadosVisitaPercentual(filtros).subscribe({
      next: (result: VisitaPercentualDashDTO[]) => this.montaGrafico(result),
      error: (err) => console.error('Erro ao carregar dados:', err)
    });
  }

  montaGrafico(dados: VisitaPercentualDashDTO[]) {
    if (!dados || dados.length === 0) {
      this.chartData = { labels: [], datasets: [{ data: [] }] };
      this.cd.markForCheck();
      return;
    }

    const labels = dados.map(d => VisitaStatusLabel[d.statusVisita as VisitaStatusEnum] || 'Desconhecido');
    const valores = dados.map(d => d.quantidade ?? 0);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Percentual de Visitas',
          data: valores,
          backgroundColor: [
            '#FF6384', // Em Andamento
            '#36A2EB', // Concluída
            '#FFCE56', // Agendada
            '#4BC0C0', // Cancelada
            '#9966FF'  // Atrasada
          ]
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.label}: ${context.parsed.toFixed(1)}%`
          }
        }
      }
    };

    this.cd.markForCheck();
  }
}
