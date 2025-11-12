import { Component, Input, OnInit } from '@angular/core';
import { StandaloneImports } from '../../../../../util/standalone-imports';
import { UsuarioClienteResumoDTO } from '../../../../dtos/usuario-cliente-resumo-dto';
import { TableLazyLoadEvent } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuariosClienteService } from '../../../../services/usuarios-cliente.service';

@Component({
  selector: 'app-clientes-usuarios-tab',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './usuarios-tab.component.html',
  providers: [MessageService, ConfirmationService]
})
export class ClientesUsuariosTabComponent implements OnInit {
  @Input({ required: true }) clienteId!: number;

  rows = 50;
  total = 0;
  loading = false;
  usuarios: UsuarioClienteResumoDTO[] = [];

  constructor(
    private readonly svc: UsuariosClienteService,
    private readonly confirm: ConfirmationService,
    private readonly messages: MessageService
  ) {}

  ngOnInit(): void {
    this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows));
    const size = event.rows ?? this.rows;
    this.loading = true;
    this.svc.listar(this.clienteId, page, size).subscribe({
      next: (resp) => {
        this.usuarios = resp.content ?? [];
        this.total = resp.totalElements ?? 0;
      },
      error: () => {
        this.usuarios = [];
        this.total = 0;
        this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar usuários.' });
      },
      complete: () => this.loading = false
    });
  }

  onToggle(usuario: UsuarioClienteResumoDTO, event: any) {
    const novoValor = !!event?.checked;
    const acao = novoValor ? 'ativar' : 'inativar';

    this.confirm.confirm({
      message: `Tem certeza que deseja ${acao} o usuário <strong>${usuario.nome}</strong>?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.inativar(usuario.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Sucesso', detail: `Usuário ${acao} com sucesso.` });
            this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
          },
          error: () => {
            usuario.ativo = !novoValor;
            this.messages.add({ severity: 'error', summary: 'Erro', detail: `Falha ao ${acao} usuário.` });
          }
        })
      },
      reject: () => {
        usuario.ativo = !novoValor;
      }
    })
  }
}

