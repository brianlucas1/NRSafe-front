import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FuncionariosClienteService } from '../../../../services/funcionarios-cliente.service';
import { FuncionarioClienteResumoDTO } from '../../../../dtos/funcionario-cliente-resumo-dto';
import { FuncionarioService } from '../../../../../../../services/funcionario-service';
import { StandaloneImports } from '../../../../../../util/standalone-imports';

@Component({
  selector: 'app-clientes-funcionarios-tab',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './funcionarios-tab.component.html',
  providers: [MessageService, ConfirmationService]
})
export class ClientesFuncionariosTabComponent {

  @Input({ required: true }) clienteId!: number;
  @Output() atualizado = new EventEmitter<void>();

  rows = 20;
  total = 0;
  loading = false;
  funcionarios: FuncionarioClienteResumoDTO[] = [];

  private lastSub?: Subscription;

  constructor(
    private readonly svc: FuncionariosClienteService,
    private readonly funcService: FuncionarioService,
    private readonly confirm: ConfirmationService,
    private readonly messages: MessageService,
    private readonly cdr: ChangeDetectorRef
  ) {}



  private emitirAtualizacao(reason: string = 'mutacao') {
    this.atualizado.emit();
  }


  onLazyLoad(event: TableLazyLoadEvent) {
    if (!this.clienteId) return;
    if (this.loading) return; // evita concorrência
    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows));
    const size = event.rows ?? this.rows;
    this.loading = true;
    if (this.lastSub) this.lastSub.unsubscribe();
    this.lastSub = this.svc.listarPorCliente(this.clienteId, page, size)
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
      next: (resp) => {
        this.funcionarios = resp.content ?? [];
        this.total = resp.totalElements ?? 0;
        this.atualizado.emit();
        this.cdr.detectChanges();
      },
      error: () => {
        this.funcionarios = [];
        this.total = 0;
        this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar funcionários.' });
      }
    });
  }

  onToggle(func: FuncionarioClienteResumoDTO, event: any) {
    const novoValor = !!event?.checked;
    const acao = novoValor ? 'ativar' : 'inativar';

    this.confirm.confirm({
      message: `Tem certeza que deseja ${acao} o funcionário <strong>${func.nome}</strong>?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.funcService.inativar({ id: func.id, nome: func.nome } as any).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Sucesso', detail: `Funcionário ${acao} com sucesso.` });
            this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
            this.emitirAtualizacao('toggle-ativo-funcionario');
          },
          error: () => {
            func.ativo = !novoValor;
            this.messages.add({ severity: 'error', summary: 'Erro', detail: `Falha ao ${acao} funcionário.` });
          }
        })
      },
      reject: () => {
        func.ativo = !novoValor;
      }
    })
  }
}
