import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { DashBoardService } from '../../../../services/dash-board-service';
import { VisitaPercentualDashDTO } from '../../../models/dtos/visita-percentual-dash-dto';
import { VisitaStatusLabel } from '../../../models/dtos/visita-status-label-dto';
import { VisitaStatusEnum } from '../../../models/enums/visita-status-enum';
import { StandaloneImports } from '../../../util/standalone-imports';
import { GraficoTortaInspecaoDTO } from '../../../models/dtos/inspecao-grafico-dto';
import { InspecaoStatusEnum } from '../../../models/enums/inspecao-status-enum';
import { InspecaoStatusLabel } from '../../../models/dtos/visita-status-inspecao-label-dto';

@Component({
  selector: 'app-dashboard-torta',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './dashboard-torta.component.html',
  styleUrl: './dashboard-torta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardTortaComponent implements OnChanges {

  @Input() filtros: any;
  chartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  chartOptions!: ChartOptions<'pie'>;
  centerTextPlugin: any;

  constructor(
    private cd: ChangeDetectorRef,
    private dashService: DashBoardService,
  ) {
    this.centralizaTotal()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filtros'] && this.filtros) {
      if (this.filtros.tipoConsulta === 'V' || this.filtros.tipoConsulta === null) {
        this.carregaTortaVisita();
      } else {
        this.carregaTortasInspecao();
      }
    }
  }

  carregaTortasInspecao() {
    this.dashService.buscaDadosInspecaoTortaPercentual(this.filtros).subscribe({
      next: (result) => this.montaGraficoInspecao(result),
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
      }
    });
  }

  carregaTortaVisita() {
    this.dashService.buscaDadosVisitaTortaPercentual(this.filtros).subscribe({
      next: (result) => this.montaGraficoVisita(result),
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
      }
    });
  }

  centralizaTotal() {
    this.centerTextPlugin = {
      id: 'centerText',
      afterDraw(chart: any) {
        const { ctx, chartArea: { width, height } } = chart;
        ctx.save();

        // Texto que você quer mostrar
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const total = chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
        const text = total.toString();

        // Centraliza no meio do canvas
        ctx.fillText(text, width / 2, height / 2);
        ctx.restore();
      }
    };
  }

  montaGraficoInspecao(dados: GraficoTortaInspecaoDTO[]) {
    if (!dados || dados.length === 0) {
      this.chartData = { labels: [], datasets: [{ data: [] }] };
      this.cd.markForCheck();
      return;
    }
    const labels = dados.map(d => InspecaoStatusLabel[d.statusInspecao as InspecaoStatusEnum] || 'Desconhecido');
    const valores = dados.map(d => d.quantidade ?? 0);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Percentual de Inspeções',
          data: valores,
          backgroundColor: [
            '#0B3D2E', // Em Andamento
            '#059669', // Concluída
            '#EA580C', // NAO INICIADA      
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

  montaGraficoVisita(dados: VisitaPercentualDashDTO[]) {
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
            '#0B3D2E', // Em Andamento
            '#059669', // Concluída
            '#EA580C', // Agendada
            '#DC2626', // Cancelada
            '#DC2626'  // Atrasada
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
