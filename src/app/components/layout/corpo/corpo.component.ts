import { Component, Input, OnInit, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { StandaloneImports } from '../../../util/standalone-imports';
import { AuthStorageService } from '../../../../services/auth/auth-storage-service';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { LayoutService } from '../layout.service';
import { MenuComponent } from '../menu/menu.component';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { filter, Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingService } from '../../../util/loading-service';
import { LoggerService } from '../../../../services/logger.service';

@Component({
    selector: 'app-corpo',
    imports: [StandaloneImports, MenuComponent, BarraSuperiorComponent],
    standalone: true,
    templateUrl: './corpo.component.html',
    styleUrl: './corpo.component.scss'
})
export class CorpoComponent implements OnDestroy {

     isLoading$: any;


    overlayMenuOpenSubscription: Subscription;
    routerSubscription: Subscription;

    menuOutsideClickListener: any;

    @ViewChild(BarraSuperiorComponent) appTopBar!: BarraSuperiorComponent;

    constructor(
        private authService: AuthStorageService,
        private authState: AuthStateService,
        private loadingService: LoadingService,
        private logger: LoggerService,
        public renderer: Renderer2,
        private layoutService: LayoutService,
        public router: Router
    ) {
        this.isLoading$ = this.loadingService.loading$;

        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                    if (this.isOutsideClicked(event)) {
                        this.hideMenu();
                    }
                });
            }

            if (this.layoutService.layoutState().staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.routerSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.hideMenu();
        });
    }


    get containerClass() {
        return {
            'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
            'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
            'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive && this.layoutService.layoutConfig().menuMode === 'static',
            'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
            'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
        };
    }


    isLogado(): boolean {
    return this.authState.estaLogado();
}


    isOutsideClicked(event: MouseEvent) {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarEl = document.querySelector('.layout-menu-button');
        const eventTarget = event.target as Node;

        return !(sidebarEl?.isSameNode(eventTarget) || sidebarEl?.contains(eventTarget) || topbarEl?.isSameNode(eventTarget) || topbarEl?.contains(eventTarget));
    }

    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({ ...prev, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
        this.unblockBodyScroll();
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }
    }

}
