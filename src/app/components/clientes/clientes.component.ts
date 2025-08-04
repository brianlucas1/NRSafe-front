import { Component, OnInit } from '@angular/core';
import { StandaloneImports } from '../../util/standalone-imports';
import { DialogCadastroClienteComponent } from './dialog-cadastro-cliente/dialog-cadastro.component';
import { MessageService } from 'primeng/api';
import { ClienteService } from '../../../services/cliente-service';
import { ClienteResponseDTO } from '../../models/response/cliente-response-dto';
import { Table } from 'primeng/table';
import { Column } from '../../util/colum-table';


@Component({
  selector: 'app-clientes',
  imports: [StandaloneImports, DialogCadastroClienteComponent],
  standalone: true,
  providers: [MessageService],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit{

  dialogCadastro: boolean = false;
  listaClientes: ClienteResponseDTO[] = [];

  cols!: Column[];

  constructor(
    private clienteService : ClienteService,
    private msgService: MessageService,
  ){    
  }

  ngOnInit(): void {
   this.buscaClientes();
  }

  async buscaClientes(){
  await this.clienteService.buscaTodosClientes()
    .subscribe({
          next: res => {
           this.listaClientes = res;
          },
          error: error => {
           this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
          }
        })
  }

  editarCliente(cliente : any){

  }

   filtro(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

  abreModalCadastro(): void {
    this.dialogCadastro = true;
  }

  fechaModalCadastro(): void {
    this.dialogCadastro = false;
    this.buscaClientes();
  }

}
