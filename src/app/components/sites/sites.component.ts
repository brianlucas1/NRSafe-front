import { Component, OnInit } from '@angular/core';
import { DialogCadastroSitesComponent } from './dialog-cadastro-sites/dialog-cadastro-sites.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Column } from '../../util/colum-table';
import { StandaloneImports } from '../../util/standalone-imports';
import { SiteResponseDTO } from '../../models/response/site-reponse-dto';
import { SiteService } from '../../../services/site-service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-sites',
  imports: [StandaloneImports, DialogCadastroSitesComponent],
  standalone: true,
  providers: [MessageService,ConfirmationService],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss'
})
export class SitesComponent implements OnInit {

  dialogCadastro: boolean = false;
  listaSites: SiteResponseDTO[] = [];
  cols!: Column[];
  siteSelecionado?: SiteResponseDTO;


  constructor(
    private siteService: SiteService,
    private confirmationService: ConfirmationService,
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
    this.siteSelecionado = undefined; // evita pré-preenchimento indevido
    this.dialogCadastro = true;
  }

  inativarSite(site:SiteResponseDTO){
      this.confirmationService.confirm({
        message: `Tem certeza de que deseja inativar/ativar esse site <strong>${site.razaoSocial}</strong>?`,
        header: 'Confirmação',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        acceptButtonStyleClass: 'p-button-success',
        rejectButtonStyleClass: 'p-button-danger',
        accept: () => {
          this.siteService.inativarSite(site.id!).subscribe(() => {
            this.msgService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Site inativado com sucesso',
            });
          this.buscaSites();       
         });
        },
        reject: () => {
        }
      });
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
