import { Component, OnInit } from '@angular/core';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { DialogCadastroClienteComponent } from '../dialog-cadastro-cliente/dialog-cadastro.component';
import { MessageService } from 'primeng/api';
import { ClienteService } from '../../../../../services/cliente-service';
import { ClienteResponseDTO } from '../../../../models/response/cliente-response-dto';
import { ClienteListResponseDTO } from '../../../../models/response/cliente-list-response-dto';
import { Table } from 'primeng/table';
import { Column } from '../../../../util/colum-table';
import { Router } from '@angular/router';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-lista-clientes',
  imports: [StandaloneImports, DialogCadastroClienteComponent],
  standalone: true,
  providers: [MessageService],
  templateUrl: './lista-clientes.component.html',
  styleUrl: './lista-clientes.component.scss'
})
export class ListaClientesComponent implements OnInit{

  dialogCadastro: boolean = false;
  listaClientes: ClienteListResponseDTO[] = [];
  rows = 10;
  totalRecords = 0;

  cols!: Column[];

  constructor(
    private clienteService : ClienteService,
    private msgService: MessageService,
    private router: Router,
  ){    
  }

  ngOnInit(): void {
   this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
  }

  async onLazyLoad(event: TableLazyLoadEvent){
    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows));
    const size = event.rows ?? this.rows;
    this.clienteService.buscaClientes(page, size)
      .subscribe({
        next: (res) => {
          this.listaClientes = res.content ?? [];
          this.totalRecords = res.totalElements ?? 0;
        },
        error: (error) => {
          this.msgService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message || 'Falha ao buscar clientes' });
          this.listaClientes = [];
          this.totalRecords = 0;
        }
      });
  }

  editarCliente(cliente : ClienteListResponseDTO){
    if (!cliente?.id) return;
    this.router.navigate(["/clientes", cliente.id]);
  }

   filtro(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

  abreModalCadastro(): void {
    this.dialogCadastro = true;
  }

  fechaModalCadastro(): void {
    this.dialogCadastro = false;
    this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
  }

}
