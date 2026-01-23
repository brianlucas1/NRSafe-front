import { Component } from '@angular/core';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { PerfilService } from '../../services/perfil-service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioResponseDTO } from '../../dtos/usuario-response-dto';
import { CorporativoService } from '../../../../../services/corporativo-service';
import { Endereco } from '../../../../models/endereco';
import { ClienteUpdateRequestDTO } from '../../dtos/cliente-request-dto';
import { MessageService } from 'primeng/api';
import { TrocaSenhaRequestDTO } from '../../dtos/troca-senha-request-dto';
import { AuthService } from '../../../../../services/auth/auth-service';
import { Router } from '@angular/router';
import { TrocarPlanoComponent } from '../troca-plano/troca-plano.component';

@Component({
  selector: 'app-visualizar-perfil',
  standalone: true,
  providers: [MessageService],
  imports: [StandaloneImports,TrocarPlanoComponent],
  templateUrl: './visualizar-perfil.component.html',
  styleUrl: './visualizar-perfil.component.scss'
})

export class VisualizarPerfilComponent {

  dadosFuncionarioForm!: FormGroup;
  dadosClienteForm!: FormGroup;
  senhaForm!: FormGroup;
  userCarregado?: UsuarioResponseDTO;

  cepConsultado?: Endereco

  isFuncionarioPerfil = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,    
    private perfilService: PerfilService,
    private corporativoService: CorporativoService,
    private msgService: MessageService,

  ) {
  }

  ngOnInit(): void {
    this.buscaDadosUsuario();
  }

  montaFormDadosFuncionario() {
    this.dadosFuncionarioForm = this.fb.group({
      nome: [this.userCarregado?.funcionario?.nome],
      email: [this.userCarregado?.email],
      cpf: [this.userCarregado?.funcionario?.cpf],
      telefone: [this.userCarregado?.funcionario?.telefone],
      celular: [this.userCarregado?.funcionario?.celular],
      dtNascimento: [this.userCarregado?.funcionario?.dtNascimento],
      cep: [this.userCarregado?.funcionario?.endereco?.cep],
      logradouro: [this.userCarregado?.funcionario?.endereco?.logradouro],
      numero: [this.userCarregado?.funcionario?.endereco?.numero],
      complemento: [this.userCarregado?.funcionario?.endereco?.complemento],
      localidade: [this.userCarregado?.funcionario?.endereco?.localidade],
      bairro: [this.userCarregado?.funcionario?.endereco?.bairro],
      uf: [this.userCarregado?.funcionario?.endereco?.uf],
    });
  }

  montaFormSenha() {
    this.senhaForm = this.fb.group({
      senhaAtual: [''],
      novaSenha: ['', [Validators.required]],
      confirmarSenha: ['', [Validators.required]]
    }, { validators: this.senhasIguaisValidator });
  }

  senhasIguaisValidator(group: AbstractControl) {
    const senha = group.get('novaSenha')?.value;
    const confirmar = group.get('confirmarSenha')?.value;
    return senha === confirmar ? null : { senhasDiferentes: true };
  }

  buscaDadosUsuario() {
    this.perfilService.buscaDadosUsuario()
      .subscribe({
        next: (res) => {
          this.isFuncionarioPerfil = !!res?.funcionario?.id;
          this.userCarregado = res;
          this.montaFormumarios();
        }
      });
  }

  montaFormumarios() {

    if (this.isFuncionarioPerfil) {
      this.montaFormDadosFuncionario();
    } else {
      this.montaFormCliente();
    }
    this.montaFormSenha();
  }

  montaFormCliente() {
    this.dadosClienteForm = this.fb.group({
      razaoSocial: [this.userCarregado?.cliente?.razaoSocial],
      email: [this.userCarregado?.email],
      cnpj: [this.userCarregado?.cliente?.cnpj],
      telefone: [this.userCarregado?.cliente?.telefone],
      cep: [this.userCarregado?.cliente?.enderecoDTO?.cep],
      logradouro: [this.userCarregado?.cliente?.enderecoDTO?.logradouro],
      numero: [this.userCarregado?.cliente?.enderecoDTO?.numero],
      complemento: [this.userCarregado?.cliente?.enderecoDTO?.complemento],
      localidade: [this.userCarregado?.cliente?.enderecoDTO?.localidade],
      bairro: [this.userCarregado?.cliente?.enderecoDTO?.bairro],
      uf: [this.userCarregado?.cliente?.enderecoDTO?.uf],
    })
  }

  trocarSenha() {

    if (this.senhaForm.valid) {

      const form = this.senhaForm.value;

      const dto: TrocaSenhaRequestDTO = {
        senhaAtual: form.senhaAtual,
        idUsuario: this.userCarregado?.idUsuario!,
        novaSenha: form.novaSenha
      };

      this.perfilService.trocarSenha(dto).subscribe({
        next: () => {
          this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Senha alterada com sucesso' }); 
          this.senhaForm.reset();
          this.authService.logout();
          this.router.navigate(["/login"])
        },
        error: () => {
          this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao alterar senha' });
        }
      })
    }
  }

  salvarFuncionario() {
    if (this.dadosFuncionarioForm.valid) {

    }
  }

  salvarCliente() {
    if (this.dadosClienteForm.valid) {

      const clienteForm = this.dadosClienteForm.value;

      const dto: ClienteUpdateRequestDTO = {
        id: this.userCarregado?.cliente?.id!,
        telefone: clienteForm.telefone,
        endereco: {
          cep: clienteForm.cep,
          logradouro: clienteForm.logradouro,
          numero: clienteForm.numero,
          complemento: clienteForm.complemento,
          localidade: clienteForm.localidade,
          bairro: clienteForm.bairro,
          uf: clienteForm.uf
        }
      };

      this.perfilService.atualizarCliente(dto).subscribe({
        next: () => {
          this.msgService.add({ severity: 'success', summary: 'Sucesso', detail: 'Perfil atualizado com sucesso' });
          this.buscaDadosUsuario
        },
        error: () => {
          this.msgService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar perfil' });
        }

      })
    }
  }

  buscaCep() {

    var cep = this.userCarregado?.funcionario?.endereco?.cep != null ? this.userCarregado?.funcionario?.endereco?.cep : this.userCarregado?.cliente?.enderecoDTO?.cep;

    this.corporativoService.consultaCep(cep!)
      .subscribe({
        next: res => {
          this.cepConsultado = res;
          this.preencheDadosEndereco();
        },
        error: error => null,
      })
  }

  preencheDadosEndereco() {
    if (this.isFuncionarioPerfil) {
      this.dadosClienteForm.get('logradouro')?.setValue(this.cepConsultado?.logradouro);
      this.dadosClienteForm.get('bairro')?.setValue(this.cepConsultado?.bairro);
      this.dadosClienteForm.get('localidade')?.setValue(this.cepConsultado?.localidade);
      this.dadosClienteForm.get('uf')?.setValue(this.cepConsultado?.uf);
    } else {
      this.dadosFuncionarioForm.get('logradouro')?.setValue(this.cepConsultado?.logradouro);
      this.dadosFuncionarioForm.get('bairro')?.setValue(this.cepConsultado?.bairro);
      this.dadosFuncionarioForm.get('localidade')?.setValue(this.cepConsultado?.localidade);
      this.dadosFuncionarioForm.get('uf')?.setValue(this.cepConsultado?.uf);
    }
  }


}
