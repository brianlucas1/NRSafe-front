import { Component, OnInit } from '@angular/core';
import { StandaloneImports } from '../../../util/standalone-imports';
import { Router, RouterModule } from '@angular/router';
import { ItemMenuComponent } from './item/item.component';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../../services/auth/auth-service';
import { AuthStorageService } from '../../../../services/auth/auth-storage-service';
import { ClienteService } from '../../../../services/cliente-service';
import { ClienteResponseDTO } from '../../../models/response/cliente-response-dto';
import { firstValueFrom } from 'rxjs';
import { Role } from '../../../models/enums/role-enum';


@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [StandaloneImports, RouterModule, ItemMenuComponent],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',

})
export class MenuComponent implements OnInit {

    clienteLogado?: ClienteResponseDTO;

    constructor(
        private authService: AuthService,
        private storage: AuthStorageService,
        private clienteService: ClienteService,
        private router: Router
    ) { }

    model: MenuItem[] = [];

    async buscaClienteLogado(): Promise<void> {
        try {
            this.clienteLogado = await firstValueFrom(this.clienteService.buscaClienteLogado());

        } catch (err) {
            console.error('Erro ao buscar cliente logado', err);
        }
    }

   async ngOnInit() {
    await this.buscaClienteLogado();

    const model: (MenuItem | null)[] = [
    {
      label: 'Início',
      icon: 'pi pi-fw pi-home',
      items: [
        { label: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: ['/dashboard'] },
        { label: 'GESTÃO DE PLANO DE AÇÃO', icon: 'pi pi-clipboard', routerLink: ['/empresas'] },
      ]
    },
    {
      label: this.clienteLogado?.razaoSocial ?? 'admin',
      icon: 'pi pi-briefcase',
      items: [
        { label: 'Colaboradores', icon: 'pi pi-user', routerLink: ['/funcionarios'] },
      ]
    },
    this.storage.hasRole(Role.ADMIN) ? {
      label: 'GERENCIAL',
      icon: 'pi pi-cog',
      items: [
        { label: 'LISTA DE CLIENTES', icon: 'pi pi-users', routerLink: ['/clientes'] },
      ]
    } : null,
    {
      label: 'Clientes',
      icon: 'pi pi-building',
      items: [
        { label: 'Empresas', icon: 'pi pi-building', routerLink: ['/empresas'] },
        { label: 'Filiais', icon: 'pi pi-building-columns', routerLink: ['/filiais'] },
        { label: 'Sites', icon: 'pi pi-hammer', routerLink: ['/sites'] },
      ]
    },
  ];

  // Filtra os nulls com predicate
  return this.model = model.filter((item): item is MenuItem => item !== null);
}


    fazerLogout() {
        this.authService.logout();
        this.router.navigate(["/login"])
    }
}
