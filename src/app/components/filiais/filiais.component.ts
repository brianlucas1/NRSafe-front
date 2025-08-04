import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StandaloneImports } from '../../util/standalone-imports';
import { DialogCadastroEmpresaComponent } from '../empresas/dialog-cadastro-empresa/dialog-cadastro-empresa.component';
import { DialogCadastroFilialComponent } from './dialog-cadastro-filial/dialog-cadastro-filial.component';
import { FilialService } from '../../../services/filial-service';
import { EmpresaResponseDTO } from '../../models/response/empresa-reponse-dto';
import { Column } from '../../util/colum-table';
import { Table } from 'primeng/table';
import { FilialResponseDTO } from '../../models/response/filial-reponse-dto';

@Component({
  selector: 'app-filiais',
  imports: [StandaloneImports, DialogCadastroFilialComponent],
  standalone: true,
  providers: [MessageService,ConfirmationService],
  templateUrl: './filiais.component.html',
  styleUrl: './filiais.component.scss'
})
export class FiliaisComponent implements OnInit {

  dialogCadastro: boolean = false;
  listaFiliais: FilialResponseDTO[] = [];
  filialSelecionada?: FilialResponseDTO;
  cols!: Column[];

  expandedRows: { [key: string]: boolean } = {};


  constructor(
    private filialService: FilialService,
   private confirmationService: ConfirmationService,
    private msgService: MessageService,
  ) { }

  ngOnInit(): void {
    this.buscaFiliais();
  }

  async buscaFiliais() {
    await this.filialService.buscaTodasFiliaisPorCliente()
      .subscribe({
        next: res => {
          this.listaFiliais = res;
        },
        error: error => {
          this.msgService.add({ severity: 'error', summary: 'Error Message', detail: error.error.message });
        }
      })
  }

  inativalFilial(filial:FilialResponseDTO){
    this.confirmationService.confirm({
      message: `Tem certeza de que deseja inativar/ativar essa filial <strong>${filial.razaoSocial}</strong>?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.filialService.inativarFilial(filial).subscribe(() => {
          this.msgService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Filial inativado com sucesso',
          });
        this.buscaFiliais();       
       });
      },
      reject: () => {
      }
    });
  }

  editarFilial(filial: any) {
    this.filialSelecionada = filial;
    this.dialogCadastro = true;
  }

  filtro(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  fechaModalCadastro(): void {
    this.buscaFiliais();
    this.dialogCadastro = false;
  }

  abreModalCadastro(): void {
    this.dialogCadastro = true;
  }

  onRowExpand(event: any) {
    this.expandedRows[event.data.id] = true;
  }

  onRowCollapse(event: any) {
    delete this.expandedRows[event.data.id];
  }

  toggleRow(empresa: any) {
    this.expandedRows[empresa.id] = !this.expandedRows[empresa.id];
  }

}
