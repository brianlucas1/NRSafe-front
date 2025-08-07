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

@Component({
  selector: 'dialog-cadastro-cliente',
  imports: [StandaloneImports],
  providers: [MessageService],
  standalone: true,
  templateUrl: './dialog-cadastro.component.html',
  styleUrl: './dialog-cadastro.component.scss'
})

export class DialogCadastroClienteComponent implements OnInit {

  @Input() visible: boolean = false;
  @Output() fechar = new EventEmitter<void>();

  clienteForm!: FormGroup;
  cepConsultado?: Endereco

  constructor(private fb: FormBuilder,
    private msgService: MessageService,
    private clienteService: ClienteService,
    private corporativoService: CorporativoService
  ) { }

  ngOnInit(): void {
    this.clienteForm = this.fb.group({
        cnpj: ['', [Validators.required, Validators.minLength(14), cnpjValido]],
      razaoSocial: ['', Validators.required],
      nomeFantasia: [''],
      email: ['', [Validators.email,Validators.required]],
      telefone: [''],
      logradouro: [{ value: '', disabled: true }],
      bairro: [{ value: '', disabled: true }],
      numero: [''],
      complemento: [''],
      localidade: [{ value: '', disabled: true }],
      uf: [{ value: '', disabled: true }],
      cep: ['', [Validators.required, validaCep]]
    });
  }


  salvar() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.msgService.add({ severity: 'error', summary: 'Error Message', detail: 'Preencher todos os campos.' });
      return;
    } else {
      const cliente = this.montaCliente();
      this.clienteService.cadastrarCliente(cliente)
          .subscribe({
          next: res => {
           this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente cadastrado com sucesso' });
           this.onHideDialog();
            },
          error: error => {
           this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
          }
        })
    }
  }

  montaCliente() {

    const formValue = this.clienteForm.getRawValue(); 
    const clienteDTO: ClienteRequestDTO = {
      cnpj: formValue.cnpj,
      razaoSocial: formValue.razaoSocial,
      nomeFantasia: formValue.nomeFantasia,
      email: formValue.email,
      telefone: formValue.telefone,
      endereco: {
        cep: formValue.cep,
        logradouro: formValue.logradouro,
        complemento: formValue.complemento,
        numero: Number(formValue.numero),
        bairro: formValue.bairro,
        localidade: formValue.localidade,
        uf: formValue.uf
      }
    };
  return clienteDTO;
  }

  buscaCep() {
    if (this.clienteForm.get('cep')?.valid) {
      this.corporativoService.consultaCep(this.clienteForm.get('cep')?.value)
        .subscribe({
          next: res => {
            this.cepConsultado = res;
            this.preencheDadosEndereco();
          },
          error: error => null,
        })
    }
  }

  preencheDadosEndereco() {
    this.clienteForm.get('logradouro')?.setValue(this.cepConsultado?.logradouro);
    this.clienteForm.get('bairro')?.setValue(this.cepConsultado?.bairro);
    this.clienteForm.get('localidade')?.setValue(this.cepConsultado?.localidade);
    this.clienteForm.get('uf')?.setValue(this.cepConsultado?.uf);
  }


  onHideDialog() {
    this.fechar.emit();
    this.clienteForm.reset();
  }

}
