import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SiteService } from '../../../../services/site-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CorporativoService } from '../../../../services/corporativo-service';
import { Endereco } from '../../../models/endereco';
import { StandaloneImports } from '../../../util/standalone-imports';
import { FilialService } from '../../../../services/filial-service';
import { validaCep } from '../../../util/cep-validator';
import { cnpjValido } from '../../../util/cnpj-validator';
import { SiteRequestDTO } from '../../../models/request/site-request-dto';
import { SiteResponseDTO } from '../../../models/response/site-reponse-dto';
import { FilialResponseDTO } from '../../../models/response/filial-reponse-dto';

@Component({
  selector: 'app-dialog-cadastro-sites',
  imports: [StandaloneImports],
  standalone: true,
  providers: [MessageService],
  templateUrl: './dialog-cadastro-sites.component.html',
  styleUrl: './dialog-cadastro-sites.component.scss'
})
export class DialogCadastroSitesComponent implements OnChanges{

  @Input()  siteSelecionado?:SiteResponseDTO;  
  @Input() visible: boolean = false;
  @Output() fechar = new EventEmitter<void>();

  listaFiliais: FilialResponseDTO[] = [];

  siteForm!: FormGroup;
  cepConsultado?: Endereco

  constructor(private fb: FormBuilder,
    private msgService: MessageService,
    private filialService: FilialService,
    private siteService: SiteService,
    private corporativoService: CorporativoService
  ) { }

  ngOnInit(): void {
    this.buscaFiliais();
    this.montaForm();
  }

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['siteSelecionado'] && this.siteSelecionado) {
        this.montaForm();
      }
      if (this.siteSelecionado?.filialVinculada) {
        this.siteForm.get('filial')?.disable();
      }
    }
      

   montaForm(){
    this.siteForm = this.fb.group({
      cnpj: [ this.siteSelecionado?.cnpj, [Validators.required, Validators.minLength(14), cnpjValido]],
      razaoSocial: [this.siteSelecionado?.razaoSocial, Validators.required],
      nomeFantasia: [this.siteSelecionado?.nomeFantasia,],
      email: [this.siteSelecionado?.email, [Validators.email]],
      telefone: [this.siteSelecionado?.telefone ],
      filial : [this.siteSelecionado?.filialVinculada, [Validators.required]],
      logradouro: [{ value: this.siteSelecionado?.enderecoDTO?.logradouro, disabled: true }],
      bairro: [{value : this.siteSelecionado?.enderecoDTO?.bairro, disabled: true } ],
      numero: [ this.siteSelecionado?.enderecoDTO?.numero],
      complemento: [ this.siteSelecionado?.enderecoDTO?.complemento],
      localidade: [{ value : this.siteSelecionado?.enderecoDTO?.localidade, disabled: true }],
      uf: [{value : this.siteSelecionado?.enderecoDTO?.uf, disabled: true }],
      cep: [this.siteSelecionado?.enderecoDTO?.cep, [Validators.required, validaCep]]
    });
  }


  salvar() {
    if (this.siteForm.invalid) {
      this.siteForm.markAllAsTouched();
      this.msgService.add({ severity: 'error', summary: 'Error Message', detail: 'Preencher todos os campos.' });
      return;
    } else {
      const site = this.montaSite();
      this.siteService.cadastrarSite(site)
        .subscribe({         
          next: res => {
             this.siteForm.reset();
            this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Site cadastrada com sucesso' });
            this.onHideDialog();
          },
          error: error => {
            this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
          }
        })
    }
  }

  montaSite() {
    const formValue = this.siteForm.getRawValue();
    const siteDTO: SiteRequestDTO = {
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
      },
      filial: formValue.filial
    }
    return siteDTO;
  }


  async buscaFiliais() {
    await this.filialService.buscaTodasFiliaisPorCliente()
      .subscribe({
        next: res => {
          this.listaFiliais = res;
        },
        error: error => {
          this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
        }
      })
  }

  buscaCep() {
    if (this.siteForm.get('cep')?.valid) {
      this.corporativoService.consultaCep(this.siteForm.get('cep')?.value)
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
    this.siteForm.get('logradouro')?.setValue(this.cepConsultado?.logradouro);
    this.siteForm.get('bairro')?.setValue(this.cepConsultado?.bairro);
    this.siteForm.get('localidade')?.setValue(this.cepConsultado?.localidade);
    this.siteForm.get('uf')?.setValue(this.cepConsultado?.uf);
  }

  onHideDialog() {
    this.fechar.emit();
  }

}
