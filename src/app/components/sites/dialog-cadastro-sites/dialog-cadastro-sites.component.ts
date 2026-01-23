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
export class DialogCadastroSitesComponent implements OnChanges {

  @Input() siteSelecionado?: SiteResponseDTO;
  @Input() visible: boolean = false;
  @Output() fechar = new EventEmitter<void>();

  listaFiliais: FilialResponseDTO[] = [];
  listaEmpresas: EmpresaResponseDTO[] = [];

  listaFiliaisOptions: any[] = [];
  listaEmpresasOptions: any[] = [];

  filialDisabled = false;
  empresaDisabled = false;

  isSaving = false;

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
      this.montaForm(); // já aplica estados
    }
  }



  montaForm() {
  this.siteForm = this.fb.group({
    id: [this.siteSelecionado?.id ?? null], // <- chave para detectar edição
    cnpj: [this.siteSelecionado?.cnpj, [Validators.required, Validators.minLength(14), cnpjValido]],
    razaoSocial: [this.siteSelecionado?.razaoSocial, Validators.required],
    email: [this.siteSelecionado?.email, [Validators.email]],
    telefone: [this.siteSelecionado?.telefone],

    filial:  [this.siteSelecionado?.filialVinculada?.id ?? null],
    empresa: [this.siteSelecionado?.empresaVinculada?.id ?? null],

    logradouro: [this.siteSelecionado?.enderecoDTO?.logradouro],
    bairro:     [this.siteSelecionado?.enderecoDTO?.bairro],
    numero:     [ this.siteSelecionado?.enderecoDTO?.numero ],
    complemento:[ this.siteSelecionado?.enderecoDTO?.complemento ],
    localidade: [this.siteSelecionado?.enderecoDTO?.localidade],
    uf:         [this.siteSelecionado?.enderecoDTO?.uf],
    cep:        [ this.siteSelecionado?.enderecoDTO?.cep, [Validators.required, validaCep] ]
  }, { validators: this.requireExactlyOneOf('filial','empresa') });

  this.setupMutualExclusion();
  this.aplicarEstadosIniciais();
}


  onFilialChange(val: number | null) { this.siteForm.get('filial')!.setValue(val ?? null); }
  onEmpresaChange(val: number | null) { this.siteForm.get('empresa')!.setValue(val ?? null); }



  private requireExactlyOneOf(...keys: string[]) {
    return (ctrl: AbstractControl) => {
      const values = keys.map(k => ctrl.get(k)?.value);
      const count = values.filter(v => v !== null && v !== undefined && v !== '').length;
      return count === 1 ? null : { exactlyOne: true };
    };
  }

 private buildPayloadFromForm() {
  const v = this.siteForm.getRawValue();

  const onlyDigits = (s?: string) => (s || '').replace(/\D+/g, '');

  return {
    id: v.id ?? null,
    cnpj: onlyDigits(v.cnpj),
    razaoSocial: v.razaoSocial,
    email: v.email || null,
    telefone: onlyDigits(v.telefone) || null,

    // NESTED endereco (o DTO do back espera isso)
    endereco: {
      cep: onlyDigits(v.cep),
      logradouro: v.logradouro,
      complemento: v.complemento || null,
      numero: v.numero ? Number(v.numero) : null,
      bairro: v.bairro,
      localidade: v.localidade,
      uf: v.uf
    },

    // NESTED empresa/filial (apenas UM deles)
    empresa: v.empresa ? { id: v.empresa } : null,
    filial:  v.filial  ? { id: v.filial  } : null
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
    this.msgService.add({ severity: 'error', summary: 'Formulário inválido', detail: 'Preencha os campos obrigatórios.' });
    return;
  }

  const payload = this.buildPayloadFromForm();
  this.isSaving = true;

  this.save$(payload).subscribe({
    next: _ => {
      this.isSaving = false;
      this.msgService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: payload.id ? 'Site atualizado com sucesso.' : 'Site cadastrado com sucesso.'
      });
      this.siteForm.reset();
      this.onHideDialog(); // emite o fechar → pai fecha modal e recarrega lista
    },
    error: err => {
      this.isSaving = false;
      const detail = err?.error?.message || 'Erro ao salvar o site.';
      this.msgService.add({ severity: 'error', summary: 'Falha no salvamento', detail });
    }
  });
}

  private save$(payload: any) {
  const isEdit = !!payload.id;
  return isEdit
    ? this.siteService.atualizarSite(payload.id, payload) // PUT/PATCH /sites/{id}
    : this.siteService.cadastrarSite(payload);            // POST /sites
}

  montaSite(): SiteRequestDTO {
  const v = this.siteForm.getRawValue();
  return {
    cnpj: v.cnpj,
    razaoSocial: v.razaoSocial,
    email: v.email,
    telefone: v.telefone,
    endereco: {
      cep: v.cep, logradouro: v.logradouro, complemento: v.complemento,
      numero: Number(v.numero), bairro: v.bairro, localidade: v.localidade, uf: v.uf
    },
    filial:  v.filial  ? { id: v.filial  } as any : null,
    empresa: v.empresa ? { id: v.empresa } as any : null
  };
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
