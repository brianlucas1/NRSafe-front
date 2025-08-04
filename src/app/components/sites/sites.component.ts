import { Component, OnInit } from '@angular/core';
import { DialogCadastroSitesComponent } from './dialog-cadastro-sites/dialog-cadastro-sites.component';
import { MessageService } from 'primeng/api';
import { Column } from '../../util/colum-table';
import { StandaloneImports } from '../../util/standalone-imports';
import { SiteResponseDTO } from '../../models/response/site-reponse-dto';
import { SiteService } from '../../../services/site-service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-sites',
  imports: [StandaloneImports, DialogCadastroSitesComponent],
  standalone: true,
  providers: [MessageService],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss'
})
export class SitesComponent  implements OnInit {

  dialogCadastro: boolean = false;
  listaSites: SiteResponseDTO[] = [];
  cols!: Column[];
  siteSelecionado?: SiteResponseDTO;
  
  
    constructor(
      private siteService: SiteService,
      private msgService: MessageService,
    ) { }

      ngOnInit(): void {
      this.buscaSites();
  }

  async buscaSites() {
    await this.siteService.buscaTodosSites()
      .subscribe({
        next: res => {
          this.listaSites = res;
        },
        error: error => {
          this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
        }
      })
  }

  abreModalCadastro(): void {
      this.dialogCadastro = true;
    }
  
    editarSite(site: any) {
      this.siteSelecionado = site
      this.dialogCadastro = true;
    }
  
    filtro(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
  
    fechaModalCadastro(): void {
      this.dialogCadastro = false;
       this.buscaSites();
    }

}
