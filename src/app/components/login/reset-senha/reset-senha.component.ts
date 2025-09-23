import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StandaloneImports } from '../../../util/standalone-imports';
import { LoginSerivce } from '../../../../services/login-service';
import { MessageService } from 'primeng/api';
import { AuthStorageService } from '../../../../services/auth/auth-storage-service';

@Component({
  selector: 'app-reset-senha',
  imports: [StandaloneImports],
  standalone: true,
  providers: [MessageService],
  templateUrl: './reset-senha.component.html',
  styleUrl: './reset-senha.component.scss'
})
export class ResetSenhaComponent implements OnInit {

  token: string = '';
  resetSenhaForm!: FormGroup;

  constructor(private route: ActivatedRoute,
    private router:Router,
    private fb: FormBuilder,
    private loginService: LoginSerivce,
    private msgService: MessageService,
    private authStorage: AuthStorageService,
    ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });

    this.authStorage.clear();
    
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

  cadastraNovaSenha() {
    if (this.resetSenhaForm.invalid) {
      this.resetSenhaForm.markAllAsTouched();
      return;
    }
     const redefinirSenhaDTO = {
      email:  this.resetSenhaForm.value.email,
      token: this.token,
      novaSenha: this.resetSenhaForm.value.novaSenha
    };

    this.loginService.resetaSenha(redefinirSenhaDTO)
    .subscribe({
        next: res =>{
        this.msgService.add({ severity: 'success', summary: 'Sucesso!', detail: res.msg });
        this.resetSenhaForm.reset();
        },
        error: error => {
           this.msgService.add({ severity: 'success', summary: 'Erro !', detail: error });
        }
      })
  }

}
