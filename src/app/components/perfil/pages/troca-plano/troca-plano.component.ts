import { ChangeDetectionStrategy, Component, computed, signal, TrackByFunction } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { StandaloneImports } from "../../../../util/standalone-imports";
import { Router } from "@angular/router";
import { AuthService } from "../../../../../services/auth/auth-service";
import { PlanoService } from "../../../../../services/plano-service";
import { AssinaturaService } from "../../../../../services/assinatura-service";
import { PlanoResponseDTO } from "../../../../models/response/plano-response-dto";
import { AssinaturaPlanoResumoDTO } from "../../../../models/dtos/assinatura-plano-resumo-dto";
import { PlanoRecursoResponseDTO } from "../../../../models/response/recurso-response-dto";
import { TrocaPlanoRequestDTO } from "../../dtos/troca-plano-request-dto";
import { AuthStateService } from "../../../../../services/auth/auth-state.service";
import { LoggerService } from "../../../../../services/logger.service";
import { Role } from "../../../../models/enums/role-enum";

@Component({
    selector: 'app-troca-plano',
    templateUrl: './troca-plano.component.html',
    styleUrl: './troca-plano.component.scss',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [StandaloneImports],
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class TrocarPlanoComponent {


   isAdmin: boolean = false;
  // Estado “claro” com Signals
  readonly planos = signal<PlanoResponseDTO[]>([]);
  readonly assinatura = signal<AssinaturaPlanoResumoDTO | null>(null);
  readonly loading = signal<boolean>(true);
  readonly errorMsg = signal<string | null>(null);

  // Derivados legíveis
  readonly idPlanoAtual = computed<number | null>(() =>
    this.assinatura() ? Number(this.assinatura()!.idPlano) : null
  );

  trackByPlanoId: TrackByFunction<PlanoResponseDTO> = (_: number, p) => p.id; // ou p.idPlano
trackByRecursoId: TrackByFunction<PlanoRecursoResponseDTO> = (_: number, r) => r.id ?? r.chave;

  constructor(
    private authState: AuthStateService,
    private logger: LoggerService,
    private planoService: PlanoService,
    private assinaturaService: AssinaturaService,
    private msg: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }


   verificarSeAdmin(): void {
          const roles = this.authState.obterPapeis();
          this.isAdmin = roles.includes(Role.ADMIN);
      }

  private carregarDados() {
    this.loading.set(true);
    this.errorMsg.set(null);

    // Dispara as duas chamadas em paralelo
    this.planoService.buscarTodosPlanosAtivos().subscribe({
      next: res => this.planos.set(res),
      error: () => {
        this.errorMsg.set('Erro ao carregar planos ativos.');
        this.msg.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar planos ativos.' });
      }
    });

    this.assinaturaService.buscaAssinaturaAtual().subscribe({
      next: res => this.assinatura.set(res),
      error: () => {
        this.errorMsg.set('Erro ao carregar assinatura atual.');
        this.msg.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar assinatura atual.' });
      },
      complete: () => this.loading.set(false)
    });
  }



  isPlanoAtual(plano: PlanoResponseDTO) {
    const idAtual = this.idPlanoAtual();
    return !!idAtual && idAtual === plano.id;
  }

  tipoDeMovimento(planoDestino: PlanoResponseDTO): 'upgrade' | 'downgrade' | 'lateral' {
    const a = this.assinatura();
    if (!a) return 'upgrade';
    if (planoDestino.precoMensal > a.precoMensal) return 'upgrade';
    if (planoDestino.precoMensal < a.precoMensal) return 'downgrade';
    return 'lateral';
  }

  confirmarTrocaPlano(plano: PlanoResponseDTO) {
    this.confirm.confirm({
      header: 'Confirmar alteração de plano',
      message: `Você está escolhendo o plano "${plano.nomePlano}". Deseja continuar?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, alterar',
      rejectLabel: 'Cancelar',
      accept: () => this.efetivarTrocaPlano(plano)
    });
  }

  private efetivarTrocaPlano(plano: PlanoResponseDTO) {

    const trocaPlanoDTO = new TrocaPlanoRequestDTO();

    trocaPlanoDTO.idPlanoAtual = this.idPlanoAtual() ?? undefined;
    trocaPlanoDTO.idPlanoNovo = plano.id;

    this.assinaturaService.trocarPlano(trocaPlanoDTO).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Sucesso', detail: 'Plano alterado com sucesso.' });
        // Recarrega apenas a assinatura para refletir o plano atual
        this.assinaturaService.buscaAssinaturaAtual().subscribe({
          next: res => this.assinatura.set(res)
        });
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível alterar o plano.' });
      }
    });
  }
}
