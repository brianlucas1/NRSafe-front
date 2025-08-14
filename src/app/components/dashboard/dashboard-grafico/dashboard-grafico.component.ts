import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { DashBoardService } from '../../../../services/dash-board-service';
import { VisitaStatusEnum, getStatusLabel } from '../../../models/enums/visita-status-enum';
import { VisitaGraficoDashDTO } from '../../../models/dtos/visita-grafico-dash-dto';
import { StandaloneImports } from '../../../util/standalone-imports';

interface PeriodoData {
  periodo: string;
  [key: string]: number | string; // chave string para evitar erros de mapped type
}

@Component({
  selector: 'app-dashboard-grafico',
  standalone: true,
    imports: [StandaloneImports],
  templateUrl: './dashboard-grafico.component.html',
  styleUrls: ['./dashboard-grafico.component.scss']
})
export class DashboardGraficoComponent implements OnChanges {

  @Input() filtros: any;

  chartData!: ChartData<'bar'>;
  chartOptions!: ChartOptions<'bar'>;

  constructor(private dashboardService: DashBoardService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filtros'] && this.filtros) {
      this.carregarGrafico();
    }
  }

  private carregarGrafico() {
    this.dashboardService.buscaDadosVisitaGraficoPercentual(this.filtros)
      .subscribe((dados: VisitaGraficoDashDTO[]) => {
        const transformado = this.transformarDados(dados);
        this.configurarGrafico(transformado);
      });
  }

  private transformarDados(dados: VisitaGraficoDashDTO[]) {
    const agrupado: PeriodoData[] = [];

    for (const item of dados) {
      if (!item.statusVisita) continue; // protege contra undefined

      const periodoStr = String(item.periodo);
      let linha = agrupado.find(p => p.periodo === periodoStr);
      if (!linha) {
        linha = { periodo: periodoStr };
        agrupado.push(linha);
      }

      const chave = item.statusVisita as string;
      const quantidade = item.quantidade ?? 0; // se undefined, considera 0
      const valorAtual = Number(linha[chave] ?? 0); // força number
      linha[chave] = valorAtual + quantidade;
    }

    // Preenche todos os status que não existirem
    const todosStatus = Object.values(VisitaStatusEnum);
    for (const linha of agrupado) {
      for (const status of todosStatus) {
        const chave = status as string;
        if (linha[chave] === undefined) {
          linha[chave] = 0;
        }
      }
    }

    return { agrupado, todosStatus };
  }

  private configurarGrafico({ agrupado, todosStatus }: { agrupado: PeriodoData[], todosStatus: VisitaStatusEnum[] }) {
    const labels = agrupado.map(p => p.periodo);

    const datasets = todosStatus.map(status => {
      const chave = status as string;
      return {
        label: getStatusLabel(status),
        data: agrupado.map(p => (p[chave] ?? 0) as number),
        backgroundColor: this.getCorStatus(status)
      };
    });

    this.chartData = { labels, datasets };
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    };
  }

  private getCorStatus(status: VisitaStatusEnum) {
    const cores: Record<VisitaStatusEnum, string> = {
      [VisitaStatusEnum.ATRASADA]: '#4caf50',
      [VisitaStatusEnum.CANCELADA]: '#f44336',
      [VisitaStatusEnum.CONCLUIDA]: '#2196f3',
      [VisitaStatusEnum.EM_ANDAMENTO]: '#ff9800',
      [VisitaStatusEnum.AGENDADA]: '#9c27b0'
    };
    return cores[status] || '#999999';
  }
}
