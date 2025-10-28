import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';

import { LoginRequest } from './login-request';
import { AuthService } from '../../../services/auth/auth-service';
import { AuthStorageService } from '../../../services/auth/auth-storage-service';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import { LoggerService } from '../../../services/logger.service';
import { LoginSerivce } from '../../../services/login-service';
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
    private authStorageService: AuthStorageService,
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
        await firstValueFrom(this.authService.login(loginRequest));
      });
      this.router.navigate(['/dashboard']);
    } catch (erro) {
      this.logger.error('Erro ao realizar login.', erro);
      this.service.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Usuário ou senha inválidos'
      });
    }
  }

}
