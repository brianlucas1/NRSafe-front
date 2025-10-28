import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';
import { LoggerService } from '../logger.service';


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authState: AuthStateService, private router: Router, private logger: LoggerService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const userRoles = this.authState.obterPapeis();

    const hasRole = userRoles.some(role => expectedRoles.includes(role));

    if (!hasRole) {
      this.logger.warn('Acesso negado: usuário não possui os papéis necessários.', { expectedRoles, userRoles });
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
