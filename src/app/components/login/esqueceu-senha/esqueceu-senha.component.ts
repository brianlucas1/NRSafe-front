import { Component } from '@angular/core';
import { LoginService } from '../../../../services/login-service';
import { StandaloneImports } from '../../../util/standalone-imports';
import { EmailRequestDTO } from '../../../models/request/email-request-dto';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-esqueceu-senha',
  imports: [StandaloneImports],
  standalone: true,
  providers: [MessageService],
  templateUrl: './esqueceu-senha.component.html',
  styleUrl: './esqueceu-senha.component.scss'
})
export class EsqueceuSenhaComponent {

  emailRequest: EmailRequestDTO = { email: '' }; 

  constructor(
    private loginService: LoginService,
    private router: Router,
     private service: MessageService,
  ) {
  }

  resetSenha() {
    if (this.emailRequest?.email?.trim()) {
       this.loginService.esqueceuSenha(this.emailRequest)
      .subscribe({
        next: res =>{
          alert('E-mail enviado com sucesso! Verifique sua caixa de entrada.');
          this.router.navigate(['/login'])
        },
        error: error => {
            this.service.add({ severity: 'error', summary: 'Error Message', detail: error?.error[0] });
        }
      })
    }
  }

}
