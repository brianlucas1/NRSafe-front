import { Component } from '@angular/core';
import { LoginSerivce } from '../../../../services/login-service';
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
  enviando = false;

  constructor(
    private loginService: LoginSerivce,
    private router: Router,
     private service: MessageService,
  ) {
  }

  resetSenha() {
    if (this.enviando || !this.emailRequest?.email?.trim()) {
      return;
    }

    this.enviando = true;
    this.loginService.esqueceuSenha(this.emailRequest)
      .subscribe({
        next: () => {
          this.exibirMensagemNeutra();
        },
        error: () => {
          this.exibirMensagemNeutra();
        }
      });
  }

  private exibirMensagemNeutra(): void {
    this.enviando = false;
    this.service.add({
      severity: 'info',
      summary: 'Recuperacao de senha',
      detail: 'Se o e-mail informado existir, enviaremos as instrucoes para redefinicao.'
    });
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }

}
