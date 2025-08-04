import { Component, OnInit } from '@angular/core';
import { StandaloneImports } from '../../util/standalone-imports';
import { DialogCadastroEmpresaComponent } from './dialog-cadastro-empresa/dialog-cadastro-empresa.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmpresaService } from '../../../services/empresa-service';
import { EmpresaResponseDTO } from '../../models/response/empresa-reponse-dto';
import { Table } from 'primeng/table';
import { Column } from '../../util/colum-table';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-empresas',
  imports: [StandaloneImports, DialogCadastroEmpresaComponent],
  standalone: true,
  providers: [MessageService,ConfirmationService],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.scss'
})

export class EmpresasComponent implements OnInit {

  dialogCadastro: boolean = false;
  listaEmpresas: EmpresaResponseDTO[] = [];
  empresaParaEditar?: EmpresaResponseDTO;
  cols!: Column[];

  expandedRows: { [key: string]: boolean } = {};

  constructor(
    private empService: EmpresaService,
    private confirmationService: ConfirmationService,
    private msgService: MessageService,
  ) { }

  ngOnInit(): void {
    this.buscaEmpresas();
  }

  async buscaEmpresas(): Promise<void> {
    try {
      this.listaEmpresas = await firstValueFrom(this.empService.buscaTodasEmpresas())
    } catch (err) {
      this.msgService.add({ severity: 'error', summary: 'Error Message', detail: 'Erro ao buscar Empresas' });
    }
  }


  inativarEmpresa(emp: EmpresaResponseDTO){
     this.confirmationService.confirm({
      message: `Tem certeza de que deseja inativar/ativar essa empresa <strong>${emp.razaoSocial}</strong>?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.empService.inativarEmpresa(emp).subscribe(() => {
          this.msgService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Empresa inativado com sucesso',
          });
        this.buscaEmpresas();       
       });
      },
      reject: () => {
      }
    });
  }

  onRowExpand(event: any) {
    this.expandedRows[event.data.id] = true;
  }

  onRowCollapse(event: any) {
    delete this.expandedRows[event.data.id];
  }
  abreModalCadastro(): void {
    this.empresaParaEditar = undefined;
    this.dialogCadastro = true;
  }

  editarEmpresa(empresa: any) {
    this.empresaParaEditar = empresa;
    this.dialogCadastro = true;
  }

  filtro(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  fechaModalCadastro(): void {
     this.buscaEmpresas();
    this.dialogCadastro = false;
  }

  toggleRow(empresa: any) {
    this.expandedRows[empresa.id] = !this.expandedRows[empresa.id];
  }

}
