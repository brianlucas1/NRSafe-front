import { Component } from '@angular/core';
import { StandaloneImports } from './app/util/standalone-imports';
import { CorpoComponent } from './app/components/layout/corpo/corpo.component';
import { PERMISSAO_TOAST_KEY } from './app/util/permissao-helper.service';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: true,
    imports: [...StandaloneImports, CorpoComponent],
})
export class AppComponent {
   readonly permissaoToastKey = PERMISSAO_TOAST_KEY;

    
   constructor() {}

}
