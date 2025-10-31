import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StandaloneImports } from '../../../util/standalone-imports';
import { Router, RouterModule } from '@angular/router';
import { ItemMenuComponent } from './item/item.component';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../../services/auth/auth-service';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { LoggerService } from '../../../../services/logger.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Role } from '../../../models/enums/role-enum';


@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [StandaloneImports, RouterModule, ItemMenuComponent],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class MenuComponent implements OnInit {

    isAdmin: boolean = false;

    constructor(
        private authService: AuthService,
        private authState: AuthStateService,
        private logger: LoggerService,
        private router: Router
    ) { }

    model: MenuItem[] = [];

    private criarModelo(rotuloUsuario?: string): void {
        if (this.isAdmin) {
            this.model = [
                {
                    label: 'Início',
                    icon: 'pi pi-fw pi-home',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: ['/dashboard'] },
                    ]
                },
                {
                    label: 'Gerencial',
                    icon: 'pi pi-cog',
                    items: [
                        { label: 'LISTA DE CLIENTES', icon: 'pi pi-users', routerLink: ['/clientes'] },
                    ]
                },
                {
                    label: 'Suporte',
                    icon: 'pi pi-cog',
                },
            ];
            return;
        }

        const labelCliente = rotuloUsuario ?? 'Cliente';
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
                label: labelCliente,
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

    private verificarSeAdmin(): void {
        const roles = this.authState.obterPapeis();
        this.isAdmin = roles.includes(Role.ADMIN);
    }

    ngOnInit(): void {
        this.verificarSeAdmin();
        // Primeiro desenho do menu
        this.criarModelo(this.authState.obterRotuloUsuario() ?? undefined);
        // Atualiza quando o rótulo mudar (ex.: após refresh inicial)
        this.authState
            .observarRotuloUsuario()
            .pipe(takeUntilDestroyed())
            .subscribe(rotulo => this.criarModelo(rotulo ?? undefined));
    }

    fazerLogout() {
        this.authService.logout();
        this.router.navigate(["/login"])
    }
}
