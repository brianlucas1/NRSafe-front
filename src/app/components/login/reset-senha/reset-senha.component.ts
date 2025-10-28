import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StandaloneImports } from '../../../util/standalone-imports';
import { LoginSerivce } from '../../../../services/login-service';
import { MessageService } from 'primeng/api';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { LoggerService } from '../../../../services/logger.service';

@Component({
  selector: 'app-reset-senha',
  imports: [StandaloneImports],
  standalone: true,
  providers: [MessageService],
  templateUrl: './reset-senha.component.html',
  styleUrl: './reset-senha.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetSenhaComponent implements OnInit {

  token: string = '';
  resetSenhaForm!: FormGroup;

  constructor(private route: ActivatedRoute,
    private router:Router,
    private fb: FormBuilder,
    private loginService: LoginSerivce,
    private msgService: MessageService,
    private authState: AuthStateService,
    private logger: LoggerService,
    ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });

    this.authState.limpar();
    
    this.resetSenhaForm = this.fb.group({
      email: ['', [Validators.required,Validators.email]],
      novaSenha: ['', [Validators.required]],
      confirmarSenha: ['', [Validators.required]]
    }, { validators: this.senhasIguaisValidator });
  }

   senhasIguaisValidator(group: AbstractControl) {
    const senha = group.get('novaSenha')?.value;
    const confirmar = group.get('confirmarSenha')?.value;
    return senha === confirmar ? null : { senhasDiferentes: true };
  }

  async cadastraNovaSenha(): Promise<void> {
    if (this.resetSenhaForm.invalid) {
      this.resetSenhaForm.markAllAsTouched();
      return;
    }
    const redefinirSenhaDTO = {
      email: this.resetSenhaForm.value.email,
      token: this.token,
      novaSenha: this.resetSenhaForm.value.novaSenha
    };

    try {
      await import('rxjs').then(async ({ firstValueFrom }) => {
        await firstValueFrom(this.loginService.resetaSenha(redefinirSenhaDTO));
      });
      this.msgService.add({ severity: 'success', summary: 'Sucesso!', detail: 'Senha alterada com sucesso.' });
      this.resetSenhaForm.reset();
    } catch (erro) {
      this.logger.error('Erro ao cadastrar nova senha.', erro);
      this.msgService.add({ severity: 'error', summary: 'Erro!', detail: 'Não foi possível redefinir a senha.' });
    }
  }

}
