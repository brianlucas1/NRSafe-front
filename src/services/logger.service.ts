import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  info(mensagem: string, ...dados: unknown[]): void {
    if (!environment.production) {
      console.info(`[INFO] ${mensagem}`, ...dados);
    }
  }

  warn(mensagem: string, ...dados: unknown[]): void {
    if (environment.production) {
      console.warn(`[WARN] ${mensagem}`);
      return;
    }
    console.warn(`[WARN] ${mensagem}`, ...dados);
  }

  error(mensagem: string, erro?: unknown, ...dados: unknown[]): void {
    if (environment.production) {
      console.error(`[ERRO] ${mensagem}`);
      return;
    }
    console.error(`[ERRO] ${mensagem}`, erro, ...dados);
  }
}

