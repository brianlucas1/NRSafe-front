import { Component } from '@angular/core';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { ResumoAssinaturaComponent } from './pages/resumo-assinatura/resumo-assinatura.component';
import { AtividadeContaComponent } from './pages/atividade-conta/atividade-conta.component';
import { FaturasComponent } from './pages/faturas/faturas.component';

@Component({
  selector: 'app-historico-pagamento',
  standalone: true,
  imports: [
    StandaloneImports,
    ResumoAssinaturaComponent,
    FaturasComponent,
    AtividadeContaComponent
  ],
  templateUrl: './historico-pagamento.component.html',
  styleUrl: './historico-pagamento.component.scss'
})
export class HistoricoPagamentoComponent {}
