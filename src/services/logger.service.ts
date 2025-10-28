import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  info(mensagem: string, ...dados: unknown[]): void {
    console.info(`[INFO] ${mensagem}`, ...dados);
  }

  warn(mensagem: string, ...dados: unknown[]): void {
    console.warn(`[WARN] ${mensagem}`, ...dados);
  }

  error(mensagem: string, erro?: unknown, ...dados: unknown[]): void {
    console.error(`[ERRO] ${mensagem}`, erro, ...dados);
  }
}

