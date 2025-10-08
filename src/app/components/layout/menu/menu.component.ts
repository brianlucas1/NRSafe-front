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
    isAdmin: boolean = false;

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
            // Erro ao buscar cliente logado
        }
    }

    verificarSeAdmin(): void {
        const roles = this.storage.getRoles();
        this.isAdmin = roles.includes(Role.ADMIN);
    }

    async ngOnInit() {
        // Verifica se é ADMIN
        this.verificarSeAdmin();

        // Só busca cliente se não for ADMIN
        if (!this.isAdmin) {
            await this.buscaClienteLogado();
        }

        // Cria o menu baseado no tipo de usuário
        if (this.isAdmin) {
            // Menu para ADMIN: Início, Gerencial, Clientes
            this.model = [
                {
                    label: 'Início',
                    icon: 'pi pi-fw pi-home',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: ['/dashboard'] },
                        { label: 'Gestão de plano ação', icon: 'pi pi-chart-bar', routerLink: ['/plano-acao'] },
                    ]
                },
                {
                    label: 'GERENCIAL',
                    icon: 'pi pi-cog',
                    items: [
                        { label: 'LISTA DE CLIENTES', icon: 'pi pi-users', routerLink: ['/clientes'] },
                    ]
                },
                {
                    label: 'Clientes',
                    icon: 'pi pi-building',
                    items: [
                        { label: 'Empresas', icon: 'pi pi-building', routerLink: ['/empresas'] },
                        { label: 'Filiais', icon: 'pi pi-building-columns', routerLink: ['/filiais'] },
                        { label: 'Sites/Setor', icon: 'pi pi-hammer', routerLink: ['/sites'] },
                    ]
                }
            ];
        } else {
            // Menu para outros usuários: Início, Cliente, Clientes (sem Gerencial)
            this.model = [
                {
                    label: 'Início',
                    icon: 'pi pi-fw pi-home',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: ['/dashboard'] },
                        { label: 'Gestão de plano ação', icon: 'pi pi-chart-bar', routerLink: ['/plano-acao'] },
                    ]
                },
                {
                    label: this.clienteLogado?.razaoSocial ?? 'Cliente',
                    icon: 'pi pi-briefcase',
                    items: [
                        { label: 'Colaboradores', icon: 'pi pi-user', routerLink: ['/funcionarios'] },
                        { label: 'Check-list', icon: 'pi pi-clipboard', routerLink: ['/check-list'] },
                    ]
                },

                {
                    label: 'Clientes',
                    icon: 'pi pi-building',
                    items: [
                        { label: 'Empresas', icon: 'pi pi-building', routerLink: ['/empresas'] },
                        { label: 'Filiais', icon: 'pi pi-building-columns', routerLink: ['/filiais'] },
                        { label: 'Sites', icon: 'pi pi-hammer', routerLink: ['/sites'] },
                    ]
                }
            ];
        }
    }

    fazerLogout() {
        this.authService.logout();
        this.router.navigate(["/login"])
    }
}
