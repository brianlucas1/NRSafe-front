import { Component, EventEmitter, input, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { StandaloneImports } from '../../../util/standalone-imports';
import { EmpresaService } from '../../../../services/empresa-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CorporativoService } from '../../../../services/corporativo-service';
import { Endereco } from '../../../models/endereco';
import { validaCep } from '../../../util/cep-validator';
import { cnpjValido } from '../../../util/cnpj-validator';
import { EmpresaRequestDTO } from '../../../models/request/empresa-request-dto';
import { EmpresaResponseDTO } from '../../../models/response/empresa-reponse-dto';

@Component({
  selector: 'app-dialog-cadastro-empresa',
  imports: [StandaloneImports],
  providers: [MessageService],
  standalone: true,
  templateUrl: './dialog-cadastro-empresa.component.html',
  styleUrl: './dialog-cadastro-empresa.component.scss'
})
export class DialogCadastroEmpresaComponent implements OnInit,OnChanges  {

  @Input() visible: boolean = false;
  @Input() empresaSelecionada?: EmpresaResponseDTO;
  @Output() fechar = new EventEmitter<void>();

  empresaForm!: FormGroup;
  cepConsultado?: Endereco

  constructor(private fb: FormBuilder,
    private msgService: MessageService,
    private empresaService: EmpresaService,
    private corporativoService: CorporativoService
  ) { }

ngOnInit(): void {
  
  if (!this.empresaSelecionada) {
    this.criaForm(); 
  }
}

ngOnChanges(changes: SimpleChanges): void {
  if (changes['empresaSelecionada']) {
    this.criaForm();
  }
}
  
  criaForm(){
     this.empresaForm = this.fb.group({
      cnpj: [ this.empresaSelecionada?.cnpj, [Validators.required, Validators.minLength(14), cnpjValido]],
      razaoSocial: [this.empresaSelecionada?.razaoSocial, Validators.required],
      nomeFantasia: [this.empresaSelecionada?.nomeFantasia,],
      email: [this.empresaSelecionada?.email, [Validators.email]],
      telefone: [this.empresaSelecionada?.telefone ],
     logradouro: [{ value: this.empresaSelecionada?.enderecoDTO?.logradouro, disabled: true }],
      bairro: [{value : this.empresaSelecionada?.enderecoDTO?.bairro, disabled: true } ],
      numero: [ this.empresaSelecionada?.enderecoDTO?.numero],
      complemento: [ this.empresaSelecionada?.enderecoDTO?.complemento],
      localidade: [{ value : this.empresaSelecionada?.enderecoDTO?.localidade, disabled: true }],
      uf: [{value : this.empresaSelecionada?.enderecoDTO?.uf, disabled: true }],
      cep: [this.empresaSelecionada?.enderecoDTO?.cep, [Validators.required, validaCep]]
    });
  }

  validaForm(){
    if(this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      this.msgService.add({ severity: 'error', summary: 'Error Message', detail: 'Preencher todos os campos.' });
      return;
    }
  }

  salvar() {
    this.validaForm();
    const empresa = this.montaEmpresa();

    if(this.empresaSelecionada?.id){
      this.atualizaEmpresa(empresa);
    }else{
     this.novaEmpresa(empresa);
    }  

  }
  
  novaEmpresa(empresa:EmpresaRequestDTO){
       this.empresaService.cadastrarEmpresa(empresa)
        .subscribe({
          next: res => {
            this.empresaForm.reset();
            this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente cadastrado com sucesso' });
            this.onHideDialog();
          },
          error: error => {
            this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
          }
        })
  }

  atualizaEmpresa(empresa:EmpresaRequestDTO){
      this.empresaService.atualizar(empresa)
        .subscribe({
          next: res => {
            this.empresaForm.reset();
            this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente cadastrado com sucesso' });
            this.onHideDialog();
          },
          error: error => {
            this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
          }
        })
  }

  montaEmpresa() {
    const formValue = this.empresaForm.getRawValue();
    const empresaDTO: EmpresaRequestDTO = {
      id : this.empresaSelecionada?.id,
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
    }
    return empresaDTO;
  }

  buscaCep() {
    if (this.empresaForm.get('cep')?.valid) {
      this.corporativoService.consultaCep(this.empresaForm.get('cep')?.value)
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
    this.empresaForm.get('logradouro')?.setValue(this.cepConsultado?.logradouro);
    this.empresaForm.get('bairro')?.setValue(this.cepConsultado?.bairro);
    this.empresaForm.get('localidade')?.setValue(this.cepConsultado?.localidade);
    this.empresaForm.get('uf')?.setValue(this.cepConsultado?.uf);
  }

  onHideDialog() {
    this.fechar.emit();
  }

}
