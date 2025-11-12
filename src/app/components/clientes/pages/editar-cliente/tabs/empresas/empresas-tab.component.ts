import { Component, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { StandaloneImports } from '../../../../../../util/standalone-imports';
import { TableLazyLoadEvent } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmpresaService } from '../../../../../../../services/empresa-service';
import { EmpresaClienteResumoDTO } from '../../../../dtos/empresa-cliente-resumo-dto';

@Component({
  selector: 'app-clientes-empresas-tab',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './empresas-tab.component.html',
  providers: [MessageService, ConfirmationService]
})
export class ClientesEmpresasTabComponent implements OnInit {
  
  @Input({ required: true }) clienteId!: number;
  @Output() atualizado = new EventEmitter<void>();

  rows = 50;
  total = 0;
  loading = false;
  empresas: EmpresaClienteResumoDTO[] = [];

  constructor(
    private readonly empresaService: EmpresaService,
    private readonly confirm: ConfirmationService,
    private readonly messages: MessageService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
  }

 
  onLazyLoad(event: TableLazyLoadEvent) {
    if (!this.clienteId || this.loading) return;
    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows));
    const size = event.rows ?? this.rows;
    this.loading = true;
    this.empresaService.listarPorCliente(this.clienteId, page, size).subscribe({
      next: (resp) => {
        this.empresas = resp.content ?? [];
        this.total = resp.totalElements ?? 0;
        this.atualizado.emit();
        this.cdr.detectChanges();
      },
      error: () => {
        this.empresas = [];
        this.total = 0;
        this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar empresas.' });
      },
      complete: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  onToggle(empresa: EmpresaClienteResumoDTO, event: any) {
    const novoValor = !!event?.checked;
    const acao = novoValor ? 'ativar' : 'inativar';
    this.confirm.confirm({
      message: `Tem certeza que deseja ${acao} a empresa <strong>${empresa.razaoSocial}</strong>?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.empresaService.inativarEmpresa({ id: empresa.id, razaoSocial: empresa.razaoSocial } as any).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Sucesso', detail: `Empresa ${acao} com sucesso.` });
            this.onLazyLoad({ first: 0, rows: this.rows } as TableLazyLoadEvent);
            this.atualizado.emit();
          },
          error: () => {
            empresa.ativo = !novoValor;
            this.messages.add({ severity: 'error', summary: 'Erro', detail: `Falha ao ${acao} empresa.` });
          }
        })
      },
      reject: () => {
        empresa.ativo = !novoValor;
      }
    })
  }
}
