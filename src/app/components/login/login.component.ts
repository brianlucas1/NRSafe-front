import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route, Router, RouterModule } from '@angular/router';


import { LoginRequest } from './login-request';
import { JwtResponse } from '../../models/jwt-response';
import { AuthService } from '../../../services/auth/auth-service';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import { LoggerService } from '../../../services/logger.service';
import { StandaloneImports } from '../../util/standalone-imports';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [StandaloneImports],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent  implements OnInit {

   loginForm!: FormGroup;

  constructor(
    private authService : AuthService,
    private service: MessageService,
    private authState: AuthStateService,
    private logger: LoggerService,
    private router: Router,
    private fb: FormBuilder
  ){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
     this.authState.limpar();
  }

  async fazerLogin(): Promise<void> {
    if(!this.loginForm.valid){
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginRequest: LoginRequest = this.loginForm.value as LoginRequest;
    
    try {
      await import('rxjs').then(async ({ firstValueFrom }) => {
        const res = await firstValueFrom(this.authService.login(loginRequest)) as JwtResponse;
 
      });
      this.router.navigate(['/dashboard']);
    } catch (erro: any) {
      this.logger.error('Erro ao realizar login.', erro);
      const status = erro?.status as number | undefined;
      const payload = erro?.error;
      const serverMsg = (typeof payload === 'string') ? payload : (payload?.message || payload?.detail || '');
      const isDisabled = status === 423 || /disabled|inativo|inativado/i.test(String(serverMsg));

      this.service.add({
        severity: 'error',
        summary: 'Erro',
        detail: isDisabled ? 'Usuário inativado, contate o suporte.' : 'Usuário ou senha inválidos'
      });
    }
  }

}
