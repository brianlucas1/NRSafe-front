import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { cnpjValido } from '../../../../util/cnpj-validator';
import { MessageService } from 'primeng/api';
import { ClienteRequestDTO } from '../../../../models/request/cliente-request-dto';
import { Endereco } from '../../../../models/endereco';
import { CorporativoService } from '../../../../../services/corporativo-service';
import { validaCep } from '../../../../util/cep-validator';
import { ClienteService } from '../../../../../services/cliente-service';
import { PlanoService } from '../../../../../services/plano-service';
import { PlanoResponseDTO } from '../../../../models/response/plano-response-dto';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { cpfValidator } from '../../../../util/cpf-validator';

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

  billingOptions = [
    { label: 'Mensal', value: 'MENSAL' as Ciclo },
    { label: 'Anual (-2 meses)', value: 'ANUAL' as Ciclo }
  ];
  ciclo: Ciclo = 'MENSAL';

  clienteForm!: FormGroup;
  cepConsultado?: Endereco;

  listaPlano: PlanoResponseDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private msgService: MessageService,
    private planoService: PlanoService,
    private clienteService: ClienteService,
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
      billingCycle: [this.ciclo]
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
  }

  preco(plano: PlanoResponseDTO): number {
    const ciclo = this.clienteForm?.value?.billingCycle as Ciclo;
    if (ciclo === 'ANUAL') {
      return Math.round(plano.precoMensal * 12 * 0.8333);
    }
    return plano.precoMensal;
  }

  resumoRecursos(plano: PlanoResponseDTO): string {
    if (!plano?.recurso?.length) return '';
    const count = plano.recurso.length;
    const top3 = plano.recurso.slice(0, 3).map(r => `${r.chave}: ${r.valor}`).join(' • ');
    const extra = count > 3 ? ` • +${count - 3}` : '';
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
      error: () => {
        this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao cadastrar cliente' });
      }
    });
  }

  onHideDialog(): void {
    this.visible = false;
    this.fechar.emit();
  }

  montaCliente(): ClienteRequestDTO {
    const v = this.clienteForm.getRawValue();
    return {
      cnpj: v.cnpj,
      razaoSocial: v.razaoSocial,
      nome: v.nome,
      cpf: v.cpf,
      email: v.email,
      telefone: v.telefone,
      enderecoDTO: {
        logradouro: v.logradouro,
        bairro: v.bairro,
        numero: v.numero,
        complemento: v.complemento,
        localidade: v.localidade,
        uf: v.uf,
        cep: v.cep
      },
      planoId: v.planoId,
      billingCycle: v.billingCycle
    } as unknown as ClienteRequestDTO;
  }
}

