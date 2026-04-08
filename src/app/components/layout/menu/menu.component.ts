import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StandaloneImports } from '../../../util/standalone-imports';
import { Router, RouterModule } from '@angular/router';
import { ItemMenuComponent } from './item/item.component';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../../services/auth/auth-service';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { LoggerService } from '../../../../services/logger.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';

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
    isClientePerfil: boolean = false;
    podeGerenciarPermissoes: boolean = false;
    appVersion = environment.version;

    constructor(
        private authService: AuthService,
        private authState: AuthStateService,
        private logger: LoggerService,
        private router: Router
    ) { }

    model: MenuItem[] = [];

    ngOnInit(): void {
        this.verificarPerfilUsuario();
        this.criarModelo(this.authState.obterRotuloUsuario() ?? undefined);
        this.authState
            .observarRotuloUsuario()
            .pipe(takeUntilDestroyed())
            .subscribe(rotulo => {
                this.verificarPerfilUsuario();
                this.criarModelo(rotulo ?? undefined);
            });
    }

    private criarModelo(rotuloUsuario?: string): void {
        if (this.isAdmin) {
            this.model = [
                {
                    label: 'Inicio',
                    icon: 'pi pi-fw pi-home',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: ['/dashboard'] },
                    ]
                },
                {
                    label: 'Gerencial',
                    icon: 'pi pi-cog'
                },
                {
                    label: 'Suporte',
                    icon: 'pi pi-cog',
                    items: [
                        { label: 'LISTA DE CLIENTES', icon: 'pi pi-users', routerLink: ['/clientes'] },
                    ]
                },
            ];
            return;
        }

        const labelCliente = rotuloUsuario ?? 'Cliente';
        this.model = [
            {
                label: 'Inicio',
                icon: 'pi pi-fw pi-home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: ['/dashboard'] },
                    { label: 'Gestao de plano acao', icon: 'pi pi-chart-bar', routerLink: ['/plano-acao'] },
                ]
            },
            {
                label: labelCliente,
                icon: 'pi pi-briefcase',
                items: [
                    { label: 'Colaboradores', icon: 'pi pi-user', routerLink: ['/funcionarios'] },
                    { label: 'Check-list', icon: 'pi pi-clipboard', routerLink: ['/check-list'] },
                    ...(this.podeGerenciarPermissoes ? [{ label: 'Permissoes', icon: 'pi pi-shield', routerLink: ['/permissoes'] }] : []),
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
            },
            ...(this.isClientePerfil ? [{
                label: 'Pagamento',
                icon: 'pi pi-credit-card',
                items: [
                    { label: 'Historico', icon: 'pi pi-history', routerLink: ['/pagamento/historico'] },
                ]
            }] : [])
        ];
    }

    private verificarPerfilUsuario(): void {
        this.isAdmin = this.authState.isSuporte();
        this.isClientePerfil = this.authState.isCliente();
        this.podeGerenciarPermissoes = this.authState.podeGerenciarPermissoes();
    }

    fazerLogout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
