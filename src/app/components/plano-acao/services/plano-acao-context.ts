// services/plano-acao-context.ts
import { Injectable } from '@angular/core';

export type PlanoAcaoContext = {
  visitaId?: number;
  planoId?: number;   // id do PLANO_ACAO (PLAC)
  panrId?: number;    // id do PLANO_ACAO_NORMA (PANR)
};

const KEY = 'planoAcaoContext';

@Injectable({ providedIn: 'root' })
export class PlanoAcaoContextService {
  private read(): PlanoAcaoContext {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as PlanoAcaoContext : {};
  }
  private write(ctx: PlanoAcaoContext) {
    sessionStorage.setItem(KEY, JSON.stringify(ctx));
  }

  captureFromNavigationState(state: Partial<PlanoAcaoContext>) {
    const prev = this.read();
    const merged = { ...prev, ...state };
    this.write(merged);
  }

  get(): PlanoAcaoContext { return this.read(); }
  clear() { sessionStorage.removeItem(KEY); }
}
