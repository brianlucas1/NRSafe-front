import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../layout.service';
import { StandaloneImports } from '../../../util/standalone-imports';
import { AuthStateService } from '../../../../services/auth/auth-state.service';

@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './barra-superior.component.html',
  styleUrl: './barra-superior.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarraSuperiorComponent {

   items!: MenuItem[];
   rotuloUsuario$!: ReturnType<AuthStateService['observarRotuloUsuario']>;

    constructor(public layoutService: LayoutService, private authState: AuthStateService) {
      this.rotuloUsuario$ = this.authState.observarRotuloUsuario();
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

}
