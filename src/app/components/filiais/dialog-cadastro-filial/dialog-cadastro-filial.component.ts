import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FilialService } from '../../../../services/filial-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CorporativoService } from '../../../../services/corporativo-service';
import { Endereco } from '../../../models/endereco';
import { validaCep } from '../../../util/cep-validator';
import { cnpjValido } from '../../../util/cnpj-validator';
import { FilialRequestDTO } from '../../../models/request/filial-request-dto';
import { StandaloneImports } from '../../../util/standalone-imports';
import { EmpresaResponseDTO } from '../../../models/response/empresa-reponse-dto';
import { EmpresaService } from '../../../../services/empresa-service';
import { FilialResponseDTO } from '../../../models/response/filial-reponse-dto';

@Component({
  selector: 'app-dialog-cadastro-filial',
  imports: [StandaloneImports],
  providers: [MessageService],
  standalone: true,
  templateUrl: './dialog-cadastro-filial.component.html',
  styleUrl: './dialog-cadastro-filial.component.scss'
})
export class DialogCadastroFilialComponent implements OnChanges {

  @Input() visible: boolean = false;
  @Input() filialSelecionada?: FilialResponseDTO;
  @Output() fechar = new EventEmitter<void>();

  listaEmpresas: EmpresaResponseDTO[] = [];

  filialForm!: FormGroup;
  cepConsultado?: Endereco

  constructor(private fb: FormBuilder,
    private empService: EmpresaService,
    private msgService: MessageService,
    private filialService: FilialService,
    private corporativoService: CorporativoService
  ) { }

  ngOnInit(): void {
    this.buscaEmpresas();
    this.montaForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filialSelecionada'] && this.filialSelecionada) {
      this.montaForm();
      if (this.filialSelecionada?.empresaVinculada) {
        this.filialForm.get('empresa')?.disable();
      }
    }
  }


  montaForm() {
    this.filialForm = this.fb.group({
      cnpj: [this.filialSelecionada?.cnpj, [Validators.required, Validators.minLength(14), cnpjValido]],
      razaoSocial: [this.filialSelecionada?.razaoSocial, Validators.required],
      nomeFantasia: [this.filialSelecionada?.nomeFantasia,],
      email: [this.filialSelecionada?.email, [Validators.email]],
      telefone: [this.filialSelecionada?.telefone],
      empresa: [this.filialSelecionada?.empresaVinculada, [Validators.required]],
      logradouro: [{ value: this.filialSelecionada?.enderecoDTO?.logradouro, disabled: true }],
      bairro: [{ value: this.filialSelecionada?.enderecoDTO?.bairro, disabled: true }],
      numero: [this.filialSelecionada?.enderecoDTO?.numero],
      complemento: [this.filialSelecionada?.enderecoDTO?.complemento],
      localidade: [{ value: this.filialSelecionada?.enderecoDTO?.localidade, disabled: true }],
      uf: [{ value: this.filialSelecionada?.enderecoDTO?.uf, disabled: true }],
      cep: [this.filialSelecionada?.enderecoDTO?.cep, [Validators.required, validaCep]]
    });
  }

  salvar() {
    this.validaForm();
     const filial = this.montaFilial();

     if(this.filialSelecionada?.id){
      this.atualizarFilial(filial);
    }else{
     this.novaFilial(filial);
    }     
  }

  atualizarFilial(filial: FilialRequestDTO){
      this.filialService.atualizarFilial(filial)
      .subscribe({
        next: res => {
          this.filialForm.reset();
          this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Filial cadastrada com sucesso' });
          this.onHideDialog();
        },
        error: error => {
          this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
        }
      })
  }

  novaFilial(filial: FilialRequestDTO){
    this.filialService.cadastrarFilial(filial)
      .subscribe({
        next: res => {
          this.filialForm.reset();
          this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Filial cadastrada com sucesso' });
          this.onHideDialog();
        },
        error: error => {
          this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
        }
      })
  }

  validaForm(){
    if(this.filialForm.invalid) {
      this.filialForm.markAllAsTouched();
      this.msgService.add({ severity: 'error', summary: 'Error Message', detail: 'Preencher todos os campos.' });
      return;
    }
  }

  async buscaEmpresas() {
    await this.empService.buscaTodasEmpresas()
      .subscribe({
        next: res => {
          this.listaEmpresas = res;
        },
        error: error => {
          this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
        }
      })
  }

  montaFilial() {
    const formValue = this.filialForm.getRawValue();
    const filialDTO: FilialRequestDTO = {
      cnpj: formValue.cnpj,
      id: this.filialSelecionada?.id,
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
      },
      empresa: formValue.empresa
    }
    return filialDTO;
  }


  buscaCep() {
    if (this.filialForm.get('cep')?.valid) {
      this.corporativoService.consultaCep(this.filialForm.get('cep')?.value)
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
    this.filialForm.get('logradouro')?.setValue(this.cepConsultado?.logradouro);
    this.filialForm.get('bairro')?.setValue(this.cepConsultado?.bairro);
    this.filialForm.get('localidade')?.setValue(this.cepConsultado?.localidade);
    this.filialForm.get('uf')?.setValue(this.cepConsultado?.uf);
  }

  onHideDialog() {
    this.fechar.emit();
  }

}
