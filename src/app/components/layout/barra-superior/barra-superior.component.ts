import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../layout.service';
import { StandaloneImports } from '../../../util/standalone-imports';

@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './barra-superior.component.html',
  styleUrl: './barra-superior.component.scss'
})
export class BarraSuperiorComponent {

   items!: MenuItem[];

    constructor(public layoutService: LayoutService) {}

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

}
