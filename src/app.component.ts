import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './app/components/layout/menu/menu.component';
import { StandaloneImports } from './app/util/standalone-imports';
import { CorpoComponent } from './app/components/layout/corpo/corpo.component';
import { AuthStorageService } from './services/auth/auth-storage-service';
import { LayoutService } from './app/components/layout/layout.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: true,
    imports: [...StandaloneImports, CorpoComponent],
})
export class AppComponent {

  

}
