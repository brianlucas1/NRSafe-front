import { Component, Input } from '@angular/core';

import { TableLazyLoadEvent } from 'primeng/table';
import { firstValueFrom } from 'rxjs';
import { AssinaturaHistoricoResponseDTO } from '../../../../../../models/dtos/assinatura-historico-response-dto';
import { AssinaturaService } from '../../../../../../../services/assinatura-service';
import { StandaloneImports } from '../../../../../../util/standalone-imports';

@Component({
  selector: 'app-clientes-historico-tab',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './historico-tab.component.html'
})
export class ClientesHistoricoTabComponent {
  @Input({ required: true }) clienteId!: number;

  historico: AssinaturaHistoricoResponseDTO[] = [];
  rows = 10;
  total = 0;
  loading = false;

  constructor(private readonly assinaturaService: AssinaturaService) {}

  async onLazyLoad(event: TableLazyLoadEvent) {
    this.loading = true;
    try {
      const page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows));
      const size = event.rows ?? this.rows;
      const resp = await firstValueFrom(this.assinaturaService.buscarHistoricoPorCliente(this.clienteId, page, size));
      this.historico = resp.content ?? [];
      this.total = resp.totalElements ?? 0;
    } finally {
      this.loading = false;
    }
  }
}

