import { Component } from '@angular/core';
import { StandaloneImports } from './app/util/standalone-imports';
import { CorpoComponent } from './app/components/layout/corpo/corpo.component';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: true,
    imports: [...StandaloneImports, CorpoComponent],
})
export class AppComponent {

    
  

}
