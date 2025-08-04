import { Component, OnInit } from '@angular/core';
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
import { LoginSerivce } from '../../../services/login-service';
import { StandaloneImports } from '../../util/standalone-imports';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [StandaloneImports],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent  implements OnInit {

   loginForm!: FormGroup;

  constructor(
    private authService : AuthService,
     private service: MessageService,
    private authStorageService: AuthStorageService,
    private router: Router,
    private fb: FormBuilder
  ){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
     this.authStorageService.clear();
  }

  fazerLogin(){
    if(this.loginForm.valid){

      const loginRequest: LoginRequest = this.loginForm.value as LoginRequest;

      this.authService.autenticaUsuario(loginRequest)
      .subscribe((res) =>{
        this.router.navigate(['/dashboard']);
      },error=>{
        console.log(error)
      this.service.add({ severity: 'error', summary: 'Error Message', detail: 'Usuario  ou senha inválidos.' });
      })
    }    
  }

}
