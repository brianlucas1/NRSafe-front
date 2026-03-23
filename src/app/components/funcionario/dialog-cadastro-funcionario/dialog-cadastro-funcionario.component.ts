import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, EmailValidator } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CorporativoService } from '../../../../services/corporativo-service';
import { FilialService } from '../../../../services/filial-service';
import { Endereco } from '../../../models/endereco';
import { EmpresaResponseDTO } from '../../../models/response/empresa-reponse-dto';
import { StandaloneImports } from '../../../util/standalone-imports';
import { EmpresaService } from '../../../../services/empresa-service';
import { cnpjValido } from '../../../util/cnpj-validator';
import { cpfValidator, sanitizeCpf } from '../../../util/cpf-validator';
import { validaCep } from '../../../util/cep-validator';
import { SiteService } from '../../../../services/site-service';
import { FilialResponseDTO } from '../../../models/response/filial-reponse-dto';
import { SiteResponseDTO } from '../../../models/response/site-reponse-dto';
import { FuncionarioRequestDTO } from '../../../models/request/funcionario-request-dto';
import { FuncionarioService } from '../../../../services/funcionario-service';
import { FuncionarioResponseDTO } from '../../../models/response/funcionario-response-dto';
import { ClienteService } from '../../../../services/cliente-service';
import { PapelClienteResponseDTO } from '../../../models/response/papel-cliente-response-dto';

@Component({
  selector: 'app-dialog-cadastro-funcionario',
  imports: [StandaloneImports],
  providers: [MessageService],
  standalone: true,
  templateUrl: './dialog-cadastro-funcionario.component.html',
  styleUrl: './dialog-cadastro-funcionario.component.scss'
})
export class DialogCadastroFuncionarioComponent implements OnChanges {

  @Input() funcionarioSelecionado?: FuncionarioResponseDTO;
  @Input() visible: boolean = false;
  @Output() fechar = new EventEmitter<void>();

  listaEmpresas: EmpresaResponseDTO[] = [];
  listaFiliais: FilialResponseDTO[] = [];
  listaSites: SiteResponseDTO[] = [];
  listaPapeis: PapelClienteResponseDTO[] = [];
  isClienteMasterSelecionado = false;

  funcionarioForm!: FormGroup;
  cepConsultado?: Endereco

  constructor(private fb: FormBuilder,
    private empService: EmpresaService,
    private filialService: FilialService,
    private funcionarioService: FuncionarioService,
    private msgService: MessageService,
    private siteService: SiteService,
    private corporativoService: CorporativoService,
    private clienteService: ClienteService
  ) { }

  ngOnInit(): void {
    this.carregaDados();
    this.montaForm();    
  }

 async ngOnChanges(changes: SimpleChanges): Promise<void> {
  if (changes['funcionarioSelecionado'] && this.funcionarioSelecionado) {
    await this.carregaDados();
    this.montaForm();    
  }
}

  montaForm(){
    this.isClienteMasterSelecionado = this.isEdicaoUsuarioClienteMaster();
    const papelValidators = this.isClienteMasterSelecionado ? [] : [Validators.required];

    this.funcionarioForm = this.fb.group({
      cpf: [this.funcionarioSelecionado?.cpf, [Validators.required, cpfValidator()]],
      email: [this.funcionarioSelecionado?.email, [Validators.required, Validators.email]],
      nome: [this.funcionarioSelecionado?.nome, [Validators.required]],
      idPapelCliente: [this.isClienteMasterSelecionado ? null : this.getPapelClienteIdInicial(), papelValidators],
      telefone: [this.funcionarioSelecionado?.telefone, ],
      celular: [this.funcionarioSelecionado?.celular, ],
      dataNascimento: [this.funcionarioSelecionado?.dtNascimento],
      logradouro: [this.funcionarioSelecionado?.endereco?.logradouro],
      bairro: [this.funcionarioSelecionado?.endereco?.bairro],
      numero: [ this.funcionarioSelecionado?.endereco?.numero],
      complemento: [this.funcionarioSelecionado?.endereco?.complemento],
      localidade: [this.funcionarioSelecionado?.endereco?.localidade],
      uf: [this.funcionarioSelecionado?.endereco?.uf],
      cep: [this.funcionarioSelecionado?.endereco?.cep, [Validators.required, validaCep]],
      empresasSelecionadas: [this.funcionarioSelecionado?.listaEmpresas?.map(e => e.id) || []],
      filiaisSelecionadas: [this.funcionarioSelecionado?.listaFilial?.map(f => f.id) || []],
      sitesSelecionados: [this.funcionarioSelecionado?.listaSites?.map(s => s.id) || []],
    })
  }

  carregaDados() {
    this.buscaEmpresas();
    this.buscaFiliais();
    this.buscaSites();
    this.buscaPapeisSelecionaveis();
  }

  salvar() {
    if(this.formularioValido()){  
      if(this.funcionarioSelecionado?.id){
        const func = this.montaEditarFuncionario();
        this.editarFuncionario(func);
      }else{
        const func = this.montaCadastroFuncionario();
        this.cadastraFuncionario(func);
      }   
    }
  }

  editarFuncionario(func: any){
    this.funcionarioService.atualizar(func)
      .subscribe({
        next: res =>{
        this.msgService.add({ severity: 'success', summary: 'Sucess Message', detail: 'Funcionario Atualizado!' });
        this.funcionarioForm.reset();
        this.onHideDialog();
        }
        ,error: erro=>{
         this.msgService.add({ severity: 'error', summary: 'Error Message', detail: erro.error.message });

        }
      })
  }

  cadastraFuncionario(func: any){
      this.funcionarioService.cadastrarFuncionario(func)
      .subscribe({
        next: res =>{
        this.msgService.add({ severity: 'success', summary: 'Sucess Message', detail: 'Funcionario criado!' });
        this.funcionarioForm.reset();
        this.onHideDialog();
        }
        ,error: erro=>{
         this.msgService.add({ severity: 'error', summary: 'Error Message', detail: erro.error.message });

        }
      })
  }

  formularioValido(){
     const formValue = this.funcionarioForm.getRawValue();
     const empresasSelecionadas = this.normalizarIds(formValue.empresasSelecionadas);
     const sitesSelecionados = this.normalizarIds(formValue.sitesSelecionados);
     const filiaisSelecionadas = this.normalizarIds(formValue.filiaisSelecionadas);

     if (this.funcionarioForm.invalid) {
      this.funcionarioForm.markAllAsTouched();
      this.msgService.add({ severity: 'error', summary: 'Error Message', detail: 'Preencher todos os campos.' });
      return false;
     }
     if(!this.isClienteMasterSelecionado && empresasSelecionadas.length === 0 && sitesSelecionados.length === 0 && filiaisSelecionadas.length === 0){
       this.msgService.add({ severity: 'error', summary: 'Error Message', detail: 'É necessário pelo menos um vinculo' });
      return false;
     }
     return true;
  }


  montaEditarFuncionario(){
     const formValue = this.funcionarioForm.getRawValue();
      const empresasSelecionadas = this.normalizarIds(formValue.empresasSelecionadas);
      const filiaisSelecionadas = this.normalizarIds(formValue.filiaisSelecionadas);
      const sitesSelecionados = this.normalizarIds(formValue.sitesSelecionados);

      const funcDTO: FuncionarioResponseDTO = {
         id: this.funcionarioSelecionado?.id,
          cpf: sanitizeCpf(formValue.cpf) ?? undefined,
          nome: formValue.nome,
          email: formValue.email,
          idPapelCliente: this.isClienteMasterSelecionado ? undefined : formValue.idPapelCliente,
          telefone: formValue.telefone,
          celular: formValue.celular,
          dtNascimento: formValue.dtNascimento,
          endereco: {
            cep: formValue.cep,
            logradouro: formValue.logradouro,
            complemento: formValue.complemento,
            numero: Number(formValue.numero),
            bairro: formValue.bairro,
            localidade: formValue.localidade,
            uf: formValue.uf
          },
          listaEmpresas: this.listaEmpresas.filter(emp => emp.id !== undefined && empresasSelecionadas.includes(emp.id)) ,
          listaFilial: this.listaFiliais.filter(emp => emp.id !== undefined && filiaisSelecionadas.includes(emp.id)) ,
          listaSites: this.listaSites.filter(emp => emp.id !== undefined && sitesSelecionados.includes(emp.id)) ,
        }
        return funcDTO;

  }

  montaCadastroFuncionario(){
    const formValue = this.funcionarioForm.getRawValue();
    const empresasSelecionadas = this.normalizarIds(formValue.empresasSelecionadas);
    const sitesSelecionados = this.normalizarIds(formValue.sitesSelecionados);
    const filiaisSelecionadas = this.normalizarIds(formValue.filiaisSelecionadas);
        const funcDTO: FuncionarioRequestDTO = {
          id: this.funcionarioSelecionado?.id,
          cpf: sanitizeCpf(formValue.cpf) ?? undefined,
          nome: formValue.nome,
          email: formValue.email,
          telefone: formValue.telefone,
          celular: formValue.celular,
          dtNascimento: formValue.dtNascimento,
          idPapelCliente: this.isClienteMasterSelecionado ? undefined : formValue.idPapelCliente,
          endereco: {
            cep: formValue.cep,
            logradouro: formValue.logradouro,
            complemento: formValue.complemento,
            numero: Number(formValue.numero),
            bairro: formValue.bairro,
            localidade: formValue.localidade,
            uf: formValue.uf
          },
          empresasId:  empresasSelecionadas,
          sitesId: sitesSelecionados,
          filiaisId: filiaisSelecionadas,
        }
        return funcDTO;
  }

  private normalizarIds(ids: number[] | null | undefined): number[] {
    return Array.isArray(ids) ? ids : [];
  }

  private isEdicaoUsuarioClienteMaster(): boolean {
    if (!this.funcionarioSelecionado?.id) return false;
    const perfil = this.normalizarPerfil(this.funcionarioSelecionado?.perfil);
    return perfil === 'CLIENTE' || perfil === 'ROLE CLIENTE' || perfil === 'CLIENTE MASTER' || perfil === 'MASTER CLIENTE';
  }

  private normalizarPerfil(perfil: string | undefined): string {
    if (!perfil) return '';
    return perfil
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_-]+/g, ' ')
      .trim()
      .toUpperCase();
  }

  private getPapelClienteIdInicial(): number | null {
    const fromId = this.funcionarioSelecionado?.idPapelCliente;
    if (typeof fromId === 'number') return fromId;

    const perfil = (this.funcionarioSelecionado?.perfil || '').trim();
    if (!perfil) return null;

    const papel = (this.listaPapeis || []).find(p => (p.nome || '').trim() === perfil);
    return papel?.id ?? null;
  }

  private aplicarPapelInicialSeNecessario() {
    const ctrl = this.funcionarioForm?.get('idPapelCliente');
    if (!ctrl) return;
    if (ctrl.value !== null && ctrl.value !== undefined && ctrl.value !== '') return;

    const id = this.getPapelClienteIdInicial();
    if (id !== null) ctrl.setValue(id);
  }

  async buscaPapeisSelecionaveis() {
    await this.clienteService.listarPapeisSelecionaveis()
      .subscribe({
        next: res => {
          this.listaPapeis = res ?? [];
          this.aplicarPapelInicialSeNecessario();
        },
        error: error => {
          this.listaPapeis = [];
          this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error?.error?.message || 'Falha ao carregar tipos de permissão.' });
        }
      })
  }

  async buscaSites() {
    await this.siteService.buscaTodosSites()
      .subscribe({
        next: res => {
          this.listaSites = res;
        }
      })
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



  preencheDadosEndereco() {
    this.funcionarioForm.get('logradouro')?.setValue(this.cepConsultado?.logradouro);
    this.funcionarioForm.get('bairro')?.setValue(this.cepConsultado?.bairro);
    this.funcionarioForm.get('localidade')?.setValue(this.cepConsultado?.localidade);
    this.funcionarioForm.get('uf')?.setValue(this.cepConsultado?.uf);
  }

  onHideDialog() {
    this.fechar.emit();
  }

  buscaCep() {
    if (this.funcionarioForm.get('cep')?.valid) {
      this.corporativoService.consultaCep(this.funcionarioForm.get('cep')?.value)
        .subscribe({
          next: res => {
            this.cepConsultado = res;
            this.preencheDadosEndereco();
          },
          error: error => null,
        })
    }
  }


}
