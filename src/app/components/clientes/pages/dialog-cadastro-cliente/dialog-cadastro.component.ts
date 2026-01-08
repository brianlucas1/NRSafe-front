import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ClienteService } from '../../../../../services/cliente-service';
import { CorporativoService } from '../../../../../services/corporativo-service';
import { PlanoService } from '../../../../../services/plano-service';
import { Endereco } from '../../../../models/endereco';
import { ClienteRequestDTO } from '../../../../models/request/cliente-request-dto';
import { PlanoResponseDTO } from '../../../../models/response/plano-response-dto';
import { validaCep } from '../../../../util/cep-validator';
import { cnpjValido } from '../../../../util/cnpj-validator';
import { cpfValidator, sanitizeCpf } from '../../../../util/cpf-validator';
import { StandaloneImports } from '../../../../util/standalone-imports';


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


  clienteForm!: FormGroup;
  cepConsultado?: Endereco;


  constructor(
    private fb: FormBuilder,
    private msgService: MessageService,
    private clienteService: ClienteService,
    private corporativoService: CorporativoService
  ) {}

  ngOnInit(): void {
    this.criaFormCliente();
  }

  criaFormCliente() {
    this.clienteForm = this.fb.group({
      cnpj: [null, [Validators.required, Validators.minLength(14), cnpjValido]],
      razaoSocial: [null, Validators.required],
      nomeFantasia: [null],
      nome: [null],
      cpf: [null, [Validators.required, Validators.minLength(14), cpfValidator()]],
      email: [null, [Validators.email, Validators.required]],
      telefone: [null],
      celular: [null],
      logradouro: [''],
      bairro: [''],
      numero: [null],
      complemento: [null],
      localidade: [''],
      uf: [''],
      cep: ['', [Validators.required, validaCep]],
    
    });
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
      celular : formValue.celular,
      nome: formValue.nome,
      cpf: sanitizeCpf(formValue.cpf),
      // se seu backend já aceita esses campos, mantenha:
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
