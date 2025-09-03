import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { PlanoAcaoContextService } from "./plano-acao-context";

// services/plano-acao-guard.ts (ajuste de validação)
@Injectable({ providedIn: 'root' })
export class PlanoAcaoContextGuard implements CanActivate {
  constructor(private router: Router, private ctx: PlanoAcaoContextService) {}

  canActivate(): boolean {
    this.ctx.captureFromNavigationState(history.state || {});
    const { visitaId, planoId } = this.ctx.get();

    if (!visitaId && !planoId) {
      this.router.navigate(['/plano-acao/visitas']);
      return false;
    }
    return true;
  }
}
