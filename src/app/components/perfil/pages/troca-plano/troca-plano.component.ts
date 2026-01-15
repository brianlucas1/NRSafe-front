import { ChangeDetectionStrategy, Component, computed, signal, TrackByFunction } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { StandaloneImports } from "../../../../util/standalone-imports";

import { PlanoService } from "../../../../../services/plano-service";
import { AssinaturaService } from "../../../../../services/assinatura-service";
import { PlanoResponseDTO } from "../../../../models/response/plano-response-dto";
import { AssinaturaPlanoResumoDTO } from "../../../../models/dtos/assinatura-plano-resumo-dto";
import { PlanoRecursoResponseDTO } from "../../../../models/response/recurso-response-dto";
import { TrocaPlanoRequestDTO } from "../../dtos/troca-plano-request-dto";
import { AuthStateService } from "../../../../../services/auth/auth-state.service";
import { LoggerService } from "../../../../../services/logger.service";

type BillingCycle = 'MENSAL' | 'ANUAL';

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
  // Estado claro com Signals
  readonly planos = signal<PlanoResponseDTO[]>([]);
  readonly assinatura = signal<AssinaturaPlanoResumoDTO | null>(null);
  readonly loading = signal<boolean>(true);
  readonly errorMsg = signal<string | null>(null);
  readonly cicloSelecionado = signal<BillingCycle>('MENSAL');
  readonly carouselResponsiveOptions = [
    { breakpoint: '1280px', numVisible: 3, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 }
  ];

  // Derivados legiveis
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
          this.isAdmin = this.authState.isSuporte();
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
      next: res => {
        this.assinatura.set(res);
        this.loading.set(false);
      },
      error: (err: any) => {
       
          this.errorMsg.set('Erro ao carregar assinatura atual.');
          this.msg.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar assinatura atual.' });
        
        this.loading.set(false);
      }
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
    const ciclo = this.cicloSelecionado() === 'ANUAL' ? 'anual' : 'mensal';
    this.confirm.confirm({
      header: 'Confirmar alteracao de plano',
      message: `Voce esta escolhendo o plano "${plano.nomePlano}" no ciclo ${ciclo}. Deseja continuar?`,
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
    trocaPlanoDTO.billingCycle = this.cicloSelecionado();

    this.assinaturaService.trocarPlano(trocaPlanoDTO).subscribe({
      next: (res) => {
        const checkoutUrl = res?.checkoutUrl?.trim();
        if (!checkoutUrl) {
          this.msg.add({ severity: 'error', summary: 'Erro', detail: 'Nao foi possivel iniciar o checkout.' });
          return;
        }

        const opened = window.open(checkoutUrl, '_blank', 'noopener');
        if (!opened) {
          this.msg.add({ severity: 'warn', summary: 'Atencao', detail: 'Permita pop-ups para abrir o checkout.' });
          return;
        }

        this.msg.add({ severity: 'info', summary: 'Checkout', detail: 'Abrindo pagamento em nova aba.' });
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Erro', detail: 'Nao foi possivel alterar o plano.' });
      }
    });
  }

  selecionarCiclo(ciclo: BillingCycle) {
    this.cicloSelecionado.set(ciclo);
  }

  getPrecoExibido(plano: PlanoResponseDTO) {
    return this.cicloSelecionado() === 'ANUAL' ? this.getPrecoAnual(plano) : plano.precoMensal;
  }

  getPrecoAnual(plano: PlanoResponseDTO) {
    return plano.precoMensal * 11;
  }

  getLimiteUsuarios(plano: PlanoResponseDTO) {
    const recursos = plano.recurso ?? [];
    const recursoUsuarios = recursos.find(r => this.isRecursoUsuarios(r));
    return recursoUsuarios?.valor ?? 'Nao informado';
  }

  recursosSecundarios(plano: PlanoResponseDTO) {
    const recursos = plano.recurso ?? [];
    return recursos.filter(r => !this.isRecursoUsuarios(r));
  }

  private isRecursoUsuarios(recurso: PlanoRecursoResponseDTO) {
    const chave = (recurso?.chave ?? '').toUpperCase();
    return chave.includes('USU') || chave.includes('LICEN');
  }
}
