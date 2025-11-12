import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DashBoardService } from '../../../../services/dash-board-service';
import { DadosTabelaVisitaDTO } from '../../../models/dtos/visita-grafico-empresa-dto';
import { StandaloneImports } from '../../../util/standalone-imports';


@Component({
  selector: 'app-dashboard-table',
   standalone: true,
  imports: [StandaloneImports],
  templateUrl: './dashboard-table.component.html',
  styleUrl: './dashboard-table.component.scss'
})
export class DashboardTableComponent  implements OnInit,OnChanges{

    @Input() filtros: any;

    graficoEmpresa: DadosTabelaVisitaDTO[] = [];
  
    datas: string[] = []; 

    constructor(   
       private dashService: DashBoardService,
    ) { }

    ngOnInit(){
      this.carregaTabelaVisita();
    }

      ngOnChanges(changes: SimpleChanges) {
        if (changes['filtros'] && this.filtros) {
          if(this.filtros.tipoConsulta === 'V' || this.filtros.tipoConsulta === null) {
            this.carregaTabelaVisita();
          }else{
           this.carrregaDadosInspecao();
          }
        }
      }

      private processaResultadoTabela(result: DadosTabelaVisitaDTO[]) {
        this.graficoEmpresa = result;
  
        // Gerar lista de datas únicas para colunas
        const setDatas = new Set<string>();
        this.graficoEmpresa.forEach(e => Object.keys(e.totais).forEach(d => setDatas.add(d)));
        this.datas = Array.from(setDatas).sort(
          (a, b) => new Date(a.split('-').reverse().join('-')).getTime() - new Date(b.split('-').reverse().join('-')).getTime()
        );
      }

     carregaTabelaVisita(){
        this.dashService.buscaDadosTabelaVisita(this.filtros).subscribe({
          next: (result) => this.processaResultadoTabela(result),
          error: (err) => console.error('Erro ao carregar dados:', err)
        });
      }

      carrregaDadosInspecao(){
        this.dashService.buscaDadosTabelaInspecao(this.filtros).subscribe({
          next: (result) => this.processaResultadoTabela(result),
          error: (err) => console.error('Erro ao carregar dados:', err)
        });
      }
}
