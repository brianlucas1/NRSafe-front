import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlanoAcaoContextService {
  private readonly K_PLANO  = 'ctx.planoId';
  private readonly K_PANR   = 'ctx.panrId';

  setPlano(id: number) { sessionStorage.setItem(this.K_PLANO, String(id)); }

  getPlano(): number | null {
    const v = sessionStorage.getItem(this.K_PLANO);
    return v ? Number(v) : null;
  }

  clearPlano() { sessionStorage.removeItem(this.K_PLANO); }

  setPanr(id: number) { sessionStorage.setItem(this.K_PANR, String(id)); }

  getPanr(): number | null {
    const v = sessionStorage.getItem(this.K_PANR);
    return v ? Number(v) : null;
  }
  
  clearPanr() { sessionStorage.removeItem(this.K_PANR); }
}
