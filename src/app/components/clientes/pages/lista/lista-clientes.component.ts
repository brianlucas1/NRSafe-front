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
  rows = 50;
  totalRecords = 0;
  sortField = 'razaoSocial';
  sortOrder: 1 | -1 = 1;
  searchTerm = '';

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
    if (event.sortField) this.sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;
    if (event.sortOrder === 1 || event.sortOrder === -1) this.sortOrder = event.sortOrder;
    const sort = `${this.sortField},${this.sortOrder === 1 ? 'asc' : 'desc'}`;
    this.clienteService.buscaClientes(page, size, sort, this.searchTerm)
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
        const q = (event.target as HTMLInputElement).value ?? '';
        this.searchTerm = q;
        this.onLazyLoad({ first: 0, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder } as TableLazyLoadEvent);
    }

  abreModalCadastro(): void {
    this.dialogCadastro = true;
  }

  fechaModalCadastro(): void {
    this.dialogCadastro = false;
    this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
  }

}
