import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { DashBoardService } from '../../../../services/dash-board-service';
import { VisitaGraficoDashDTO } from '../../../models/dtos/visita-grafico-dash-dto';
import { VisitaStatusEnum, getStatusLabel } from '../../../models/enums/visita-status-enum';
import { StandaloneImports } from '../../../util/standalone-imports';
import { InspecaoGraficoDashDTO } from '../../../models/dtos/inspecao-grafico-dash-dto';
import { InspecaoStatusEnum } from '../../../models/enums/inspecao-status-enum';

interface PeriodoData {
  periodo: string;
  [key: string]: number | string;
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
      if (this.filtros.tipoConsulta === 'V' || this.filtros.tipoConsulta === null) {
        this.carregarGraficoVisita();
      } else {
        this.carregaGraficoInspecao()
      }
    }
  }

  private carregaGraficoInspecao() {
    this.dashboardService.buscaDadosInspecaoGraficoPercentual(this.filtros)
      .subscribe((dados: InspecaoGraficoDashDTO[]) => {
        const agrupado = this.transformarDados(dados);
        this.configurarGrafico<InspecaoStatusEnum>({
          agrupado,
          todosStatus: this.getTodosStatus('I') as InspecaoStatusEnum[],
          getLabel: (status: InspecaoStatusEnum) => status,
          getColor: (status: InspecaoStatusEnum) => this.getCorInspecao(status)
        });
      });
  }

  private carregarGraficoVisita() {
    this.dashboardService.buscaDadosVisitaGraficoPercentual(this.filtros)
      .subscribe((dados: VisitaGraficoDashDTO[]) => {
        const agrupado = this.transformarDados(dados);
        this.configurarGrafico<VisitaStatusEnum>({
          agrupado,
          todosStatus: this.getTodosStatus('V') as VisitaStatusEnum[],
          getLabel: (status: VisitaStatusEnum) => getStatusLabel(status),
          getColor: (status: VisitaStatusEnum) => this.getCorVisita(status)
        });
      });
  }

  // Atualize transformarDados para retornar apenas agrupado:
  private transformarDados(dados: (VisitaGraficoDashDTO | InspecaoGraficoDashDTO)[]): PeriodoData[] {
    const agrupado: PeriodoData[] = [];
    for (const item of dados) {
      const status = (item as any).statusVisita ?? (item as any).statusInspecao;
      if (!status) continue;
      const periodoStr = String(item.periodo);
      let linha = agrupado.find(p => p.periodo === periodoStr);
      if (!linha) {
        linha = { periodo: periodoStr };
        agrupado.push(linha);
      }
      const chave = (item as any).statusVisita ?? (item as any).statusInspecao;
      const quantidade = item.quantidade ?? 0;
      const valorAtual = Number(linha[chave] ?? 0);
      linha[chave] = valorAtual + quantidade;
    }
    return agrupado;
  }

  private getTodosStatus(tipoConsulta: 'V' | 'I'): VisitaStatusEnum[] | InspecaoStatusEnum[] {
    if (tipoConsulta === 'V' || tipoConsulta === null) {
      return Object.values(VisitaStatusEnum) as VisitaStatusEnum[];
    }
    return Object.values(InspecaoStatusEnum) as InspecaoStatusEnum[];
  }

  private configurarGrafico<TStatus>({ agrupado, todosStatus, getLabel, getColor }: {
    agrupado: PeriodoData[];
    todosStatus: TStatus[];
    getLabel: (status: TStatus) => string;
    getColor: (status: TStatus) => string;
  }) {
    const labels = agrupado.map(p => p.periodo);

    const datasets = todosStatus.map(status => {
      const chave = status as string;
      return {
        label: getLabel(status),
        data: agrupado.map(p => (p[chave] ?? 0) as number),
        backgroundColor: getColor(status)
      };
    });

    this.chartData = { labels, datasets };
    this.chartOptions = {
       responsive: true,
      maintainAspectRatio: false,   
        aspectRatio: 1.2,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (ctx: any) => {
              const v = typeof ctx.parsed === 'object' ? ctx.parsed?.y : ctx.parsed;
              return ` ${ctx.dataset?.label ?? ''}: ${Number(v) || 0}`;
            },
            footer: (items: any) => {
              const total = items.reduce((sum: any, it: any) => {
                const v = typeof it.parsed === 'object' ? it.parsed?.y : it.parsed;
                return sum + (Number(v) || 0);
              }, 0);
              return `Total de visitas: ${total}`;
            },
          },
          footerSpacing: 6 // um espacinho antes do total (opcional)
        },
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true },
      },
    } as any; // ou tipar como ChartOptions<'bar'>
  }

  private getCorVisita(status: VisitaStatusEnum) {
    const cores: Record<VisitaStatusEnum, string> = {
      [VisitaStatusEnum.ATRASADA]: '#EA580C',
      [VisitaStatusEnum.CANCELADA]: '#DC2626',
      [VisitaStatusEnum.CONCLUIDA]: '#059669',
      [VisitaStatusEnum.EM_ANDAMENTO]: '#0B3D2E',
      [VisitaStatusEnum.AGENDADA]: '#0c65ea'
    };
    return cores[status] || '#999999';
  }

  private getCorInspecao(status: InspecaoStatusEnum) {
    const cores: Record<InspecaoStatusEnum, string> = {
      [InspecaoStatusEnum.NAO_INICIADA]: '#EA580C',
      [InspecaoStatusEnum.EM_ANDAMENTO]: '#0B3D2E',
      [InspecaoStatusEnum.CONCLUIDA]: '#059669',

    };
    return cores[status] || '#999999';
  }
}
