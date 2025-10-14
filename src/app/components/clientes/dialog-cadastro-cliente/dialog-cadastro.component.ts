import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StandaloneImports } from '../../../util/standalone-imports';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { cnpjValido } from '../../../util/cnpj-validator';
import { MessageService } from 'primeng/api';
import { ClienteRequestDTO } from '../../../models/request/cliente-request-dto';
import { Endereco } from '../../../models/endereco';
import { CorporativoService } from '../../../../services/corporativo-service';
import { validaCep } from '../../../util/cep-validator';
import { ClienteService } from '../../../../services/cliente-service';
import { PlanoService } from '../../../../services/plano-service';
import { PlanoResponseDTO } from '../../../models/response/plano-response-dto';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { cpfValidator, sanitizeCpf } from '../../../util/cpf-validator';

export type Ciclo = 'MENSAL' | 'ANUAL';

@Component({
  selector: 'dialog-cadastro-cliente',
  providers: [MessageService],
  standalone: true,
  imports: [StandaloneImports,  SelectButtonModule,RadioButtonModule],
  templateUrl: './dialog-cadastro.component.html',
  styleUrl: './dialog-cadastro.component.scss'
})
export class DialogCadastroClienteComponent implements OnInit {


  @Input() visible = false;
  @Output() fechar = new EventEmitter<void>();  

  // === NOVO: opções de ciclo (para o p-selectButton do template)
  billingOptions = [
    { label: 'Mensal', value: 'MENSAL' as Ciclo },
    { label: 'Anual (-2 meses)', value: 'ANUAL' as Ciclo }
  ];
  ciclo: Ciclo = 'MENSAL';

  clienteForm!: FormGroup;
  cepConsultado?: Endereco;

  // Planos vindos da API
  listaPlano: PlanoResponseDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private msgService: MessageService,
    private planoService: PlanoService,
    private clienteService: ClienteService,
    private corporativoService: CorporativoService
  ) {}

  ngOnInit(): void {
    this.criaFormCliente();
    this.buscaPlanosAtivos();
  }

  criaFormCliente() {
    this.clienteForm = this.fb.group({
      cnpj: [null, [Validators.required, Validators.minLength(14), cnpjValido]],
      razaoSocial: [null, Validators.required],
      nome: [null],
      cpf: [null, [Validators.required, Validators.minLength(14), cpfValidator()]],
      email: [null, [Validators.email, Validators.required]],
      telefone: [null],
      logradouro: [{ value: '', disabled: true }],
      bairro: [{ value: '', disabled: true }],
      numero: [null],
      complemento: [null],
      localidade: [{ value: '', disabled: true }],
      uf: [{ value: '', disabled: true }],
      cep: ['', [Validators.required, validaCep]],
      planoId: [null as number | null, [Validators.required]],
      billingCycle: [this.ciclo] // 'MENSAL' por padrão
    });
  }

  buscaPlanosAtivos() {
    this.planoService.buscarTodosPlanosAtivos().subscribe({
      next: (res) => (this.listaPlano = res || []),
      error: () => this.listaPlano = []
    });
  }

  onSelectPlano(id: number | string) {
  this.clienteForm.get('planoId')?.setValue(Number(id), { emitEvent: true });
  console.log('Plano selecionado:', id);
}

  // === HELPERS para manter o template limpo
  preco(plano: PlanoResponseDTO): number {
    const ciclo = this.clienteForm?.value?.billingCycle as Ciclo;
    if (ciclo === 'ANUAL') {
      // política: anual = 12 * mensal * 0.8333 (~2 meses grátis)
      return Math.round(plano.precoMensal * 12 * 0.8333);
    }
    return plano.precoMensal;
  }

  resumoRecursos(plano: PlanoResponseDTO): string {
    if (!plano?.recurso?.length) return '';
    const count = plano.recurso.length;
    const top3 = plano.recurso.slice(0, 3).map(r => `${r.chave}: ${r.valor}`).join(' • ');
    const extra = count > 3 ? ` • +${count - 3}` : '';  // ← só se for >3
    return top3 + extra;
  }

  salvar() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos.' });
      return;
    }

    const cliente = this.montaCliente();
    this.clienteService.cadastrarCliente(cliente).subscribe({
      next: () => {
        this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente cadastrado com sucesso' });
        this.onHideDialog();
      },
      error: (error) => {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Falha ao cadastrar cliente' });
      }
    });
  }

  // === AJUSTE: incluir planoId (e opcionalmente billingCycle) no DTO
  montaCliente(): ClienteRequestDTO {
    const formValue = this.clienteForm.getRawValue();

    const clienteDTO: ClienteRequestDTO = {
      cnpj: formValue.cnpj,
      razaoSocial: formValue.razaoSocial,
      nomeFantasia: formValue.nomeFantasia,
      email: formValue.email,
      telefone: formValue.telefone,
      nome: formValue.nome,
      cpf: sanitizeCpf(formValue.cpf),
      // se seu backend já aceita esses campos, mantenha:
      planoId: formValue.planoId,             // <-- importante!
      billingCycle: formValue.billingCycle,   // <-- opcional
      endereco: {
        cep: formValue.cep,
        logradouro: formValue.logradouro,
        complemento: formValue.complemento,
        numero: Number(formValue.numero),
        bairro: formValue.bairro,
        localidade: formValue.localidade,
        uf: formValue.uf
      }
    } as ClienteRequestDTO;

    return clienteDTO;
  }

  buscaCep() {
    if (this.clienteForm.get('cep')?.valid) {
      this.corporativoService.consultaCep(this.clienteForm.get('cep')?.value).subscribe({
        next: (res) => { this.cepConsultado = res; this.preencheDadosEndereco(); },
        error: () => {}
      });
    }
  }

  preencheDadosEndereco() {
    this.clienteForm.patchValue({
      logradouro: this.cepConsultado?.logradouro ?? '',
      bairro: this.cepConsultado?.bairro ?? '',
      localidade: this.cepConsultado?.localidade ?? '',
      uf: this.cepConsultado?.uf ?? ''
    });
  }

  onHideDialog() {
    this.fechar.emit();
    this.clienteForm.reset({ billingCycle: 'MENSAL', planoId: null });
  }
}
