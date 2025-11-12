import { Component, Input } from '@angular/core';
import { StandaloneImports } from '../../../../../../util/standalone-imports';


@Component({
  selector: 'app-clientes-plano-tab',
  standalone: true,
  imports: [StandaloneImports],
  template: `<p-message severity="info" text="Gerenciamento de plano (em construção)"></p-message>`
})
export class ClientesPlanoTabComponent {
  @Input({ required: true }) clienteId!: number;
}

