import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthStorageService } from './auth-storage-service';


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authStorage: AuthStorageService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const userRoles = this.authStorage.getRoles();

    const hasRole = userRoles.some(role => expectedRoles.includes(role));

    if (!hasRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}