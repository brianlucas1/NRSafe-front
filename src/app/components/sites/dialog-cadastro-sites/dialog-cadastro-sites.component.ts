import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SiteService } from '../../../../services/site-service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
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
import { EmpresaService } from '../../../../services/empresa-service';
import { EmpresaResponseDTO } from '../../../models/response/empresa-reponse-dto';

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
  listaEmpresas: EmpresaResponseDTO[] = [];

  listaFiliaisOptions: any[] = [];
  listaEmpresasOptions: any[] = [];

  filialDisabled = false;
  empresaDisabled = false;  

  siteForm!: FormGroup;
  cepConsultado?: Endereco

  constructor(private fb: FormBuilder,
    private empService: EmpresaService,    
    private msgService: MessageService,
    private filialService: FilialService,
    private siteService: SiteService,
    private corporativoService: CorporativoService
  ) { }

  ngOnInit(): void {
    this.buscaEmpresas();
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
      filial : [this.siteSelecionado?.filialVinculada, ],
      empresa : [this.siteSelecionado?.empresaVinculada, ],
      logradouro: [{ value: this.siteSelecionado?.enderecoDTO?.logradouro, disabled: true }],
      bairro: [{value : this.siteSelecionado?.enderecoDTO?.bairro, disabled: true } ],
      numero: [ this.siteSelecionado?.enderecoDTO?.numero],
      complemento: [ this.siteSelecionado?.enderecoDTO?.complemento],
      localidade: [{ value : this.siteSelecionado?.enderecoDTO?.localidade, disabled: true }],
      uf: [{value : this.siteSelecionado?.enderecoDTO?.uf, disabled: true }],
      cep: [this.siteSelecionado?.enderecoDTO?.cep, [Validators.required, validaCep]]
    });
    { validators: [this.requireExactlyOneOf('filial', 'empresa')] } // <-- AQUI dentro

  this.setupMutualExclusion();
  this.aplicarEstadosIniciais();

  }

  onFilialChange(val: any) {
  const ctrl = this.siteForm.get('filial')!;
  if (val && val.id == null) { ctrl.setValue(null); } // transforma “Selecione” em null
}

onEmpresaChange(val: any) {
  const ctrl = this.siteForm.get('empresa')!;
  if (val && val.id == null) { ctrl.setValue(null); } // idem
}

  private requireExactlyOneOf(...keys: string[]) {
    return (ctrl: AbstractControl) => {
      const values = keys.map(k => ctrl.get(k)?.value);
      const count = values.filter(v => v !== null && v !== undefined && v !== '').length;
      return count === 1 ? null : { exactlyOne: true };
    };
  }

  private setupMutualExclusion() {
    const filialCtrl = this.siteForm.get('filial')!;
    const empresaCtrl = this.siteForm.get('empresa')!;

    filialCtrl.valueChanges.subscribe((val) => {
      const temFilial = !!val;
      this.filialDisabled = false;
      if (temFilial) {
        this.empresaDisabled = true;
        empresaCtrl.setValue(null, { emitEvent: false });
        empresaCtrl.disable({ emitEvent: false });
      } else {
        this.empresaDisabled = false;
        empresaCtrl.enable({ emitEvent: false });
      }
    });

    empresaCtrl.valueChanges.subscribe((val) => {
      const temEmpresa = !!val;
      this.empresaDisabled = false;
      if (temEmpresa) {
        this.filialDisabled = true;
        filialCtrl.setValue(null, { emitEvent: false });
        filialCtrl.disable({ emitEvent: false });
      } else {
        this.filialDisabled = false;
        filialCtrl.enable({ emitEvent: false });
      }
    });

    // aplica o estado inicial (ex.: edição)
    this.aplicarEstadosIniciais();
  }

  private aplicarEstadosIniciais() {
    const filialCtrl = this.siteForm.get('filial')!;
    const empresaCtrl = this.siteForm.get('empresa')!;
    if (filialCtrl.value) {
      empresaCtrl.disable({ emitEvent: false });
      this.empresaDisabled = true;
    } else if (empresaCtrl.value) {
      filialCtrl.disable({ emitEvent: false });
      this.filialDisabled = true;
    } else {
      filialCtrl.enable({ emitEvent: false });
      empresaCtrl.enable({ emitEvent: false });
      this.filialDisabled = this.empresaDisabled = false;
    }
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
      filial: formValue.filial,
      empresa: formValue.empresa
    }
    return siteDTO;
  }


 buscaFiliais() {
  this.filialService.buscaTodasFiliaisPorCliente().subscribe({
    next: res => {
      this.listaFiliais = res;
      this.listaFiliaisOptions = [{ id: null, razaoSocial: 'Selecione' }, ...res];
    },
    error: error => this.msgService.add({ severity: 'error', summary: 'Erro', detail: error.error.message })
  });
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

 
buscaEmpresas() {
  this.empService.buscaTodasEmpresas().subscribe({
    next: res => {
      this.listaEmpresas = res;
      this.listaEmpresasOptions = [{ id: null, razaoSocial: 'Selecione' }, ...res];
    },
    error: error => this.msgService.add({ severity: 'error', summary: 'Erro', detail: error.error.message })
  });
}

}
