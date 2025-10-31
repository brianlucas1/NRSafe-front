import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, catchError, of, tap, Subject, startWith } from 'rxjs';
import { ClienteDetalhesService } from '../../services/cliente-detalhes.service';
import { ClienteDetalhesResponseDTO } from '../../dtos/cliente-detalhes-response-dto';
import { LoggerService } from '../../../../../services/logger.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FuncionarioService } from '../../../../../services/funcionario-service';
import { EmpresaService } from '../../../../../services/empresa-service';
import { UsuarioClienteResumoDTO } from '../../dtos/usuario-cliente-resumo-dto';
import { ClientesFuncionariosTabComponent } from './tabs/funcionarios/funcionarios-tab.component';
import { ClientesHistoricoTabComponent } from './tabs/historico/historico-tab.component';
import { ClientesEmpresasTabComponent } from './tabs/empresas/empresas-tab.component';
import { ClientesPlanoTabComponent } from './tabs/plano/plano-tab.component';

interface ViewModel {
  carregando: boolean;
  erro?: string | null;
  detalhes?: ClienteDetalhesResponseDTO | null;
}

@Component({
  selector: 'app-editar-cliente',
  standalone: true,
  imports: [StandaloneImports, ClientesFuncionariosTabComponent, ClientesHistoricoTabComponent, ClientesEmpresasTabComponent, ClientesPlanoTabComponent],
  templateUrl: './editar-cliente.component.html',
  styleUrl: './editar-cliente.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService]
})
export class EditarClienteComponent {
  readonly vm$;
  private readonly refresh$ = new Subject<void>();
  clienteId!: number;
  activeIndex = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: ClienteDetalhesService,
    private readonly logger: LoggerService,
    private readonly confirmation: ConfirmationService,
    private readonly messages: MessageService,
    private readonly funcService: FuncionarioService,
    private readonly empresaService: EmpresaService
  ) {
    this.vm$ = this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      tap(id => this.clienteId = id),
      switchMap(id => this.refresh$.pipe(
        startWith(void 0),
        switchMap(() => this.service.buscarResumoCliente(id).pipe(
          map((detalhes): ViewModel => ({ carregando: false, detalhes })),
          catchError((erro) => {
            this.logger.error('Falha ao buscar detalhes do cliente.', erro);
            return of({ carregando: false, erro: 'Não foi possível carregar os dados.' } as ViewModel);
          })
        ))
      )),
      (source$) => of({ carregando: true } as ViewModel).pipe(switchMap(() => source$))
    );
  }

  private recarregar(): void {
    this.refresh$.next();
  }

  onFilhoAtualizou(): void {
    this.refresh$.next();
  }

  onToggleUsuario(usuario: UsuarioClienteResumoDTO, event?: any): void {
    const novoValor = event?.checked ?? !usuario.ativo;
    const acao = novoValor ? 'ativar' : 'inativar';
    this.confirmation.confirm({
      message: `Tem certeza que deseja ${acao} o usuário <strong>${usuario.nome}</strong>?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Usa serviço de funcionário existente para alternar o status
        this.funcService.inativar({ id: usuario.id, nome: usuario.nome } as any).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Sucesso', detail: `Usuário ${acao} com sucesso.` });
            this.recarregar();
          },
          error: () => {
            usuario.ativo = !novoValor; // reverte em caso de erro
            this.messages.add({ severity: 'error', summary: 'Erro', detail: `Falha ao ${acao} usuário.` });
          }
        });
      },
      reject: () => {
        usuario.ativo = !novoValor; // reverte UI
      }
    });
  }

  // Toggle de empresa movido para o empresas-tab

  // histórico movido para componente filho
}
