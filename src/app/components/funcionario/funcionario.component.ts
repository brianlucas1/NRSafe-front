import { Component, input, OnInit, ViewEncapsulation } from '@angular/core';
import { DialogCadastroFuncionarioComponent } from './dialog-cadastro-funcionario/dialog-cadastro-funcionario.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StandaloneImports } from '../../util/standalone-imports';
import { Column } from '../../util/colum-table';
import { FuncionarioResponseDTO } from '../../models/response/funcionario-response-dto';
import { FuncionarioService } from '../../../services/funcionario-service';
import { firstValueFrom } from 'rxjs';
import { DesvincularFuncionarioDTO } from '../../models/request/funcionario-desvincular-dto';
import { EmpresaResponseDTO } from '../../models/response/empresa-reponse-dto';
import { FilialResponseDTO } from '../../models/response/filial-reponse-dto';
import { SiteResponseDTO } from '../../models/response/site-reponse-dto';

@Component({
  selector: 'app-funcionario',
  imports: [StandaloneImports, DialogCadastroFuncionarioComponent],
  standalone: true,
  providers: [MessageService, ConfirmationService],
  templateUrl: './funcionario.component.html',
  styleUrl: './funcionario.component.scss'
})
export class FuncionarioComponent implements OnInit {

  dialogCadastro: boolean = false;
  listaFuncionarios: FuncionarioResponseDTO[] = [];
  funcionarioSelecionado? : FuncionarioResponseDTO;
  cols!: Column[];

  displayInativaFuncionario: boolean = false;
  expandedRows: { [key: string]: boolean } = {};

  constructor(
    private msgService: MessageService,
    private funcService: FuncionarioService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.buscaFuncionariosDoCliente();
  }

  async buscaFuncionariosDoCliente() {
    try {
      this.listaFuncionarios = await firstValueFrom(this.funcService.buscaFuncionariosPorCliente())
    } catch (err) {
      this.msgService.add({ severity: 'error', summary: 'Error Message', detail: 'Erro ao buscar Empresas' });
    }
  }



  inativaFuncionario(func: FuncionarioResponseDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza de que deseja inativar/ativar o funcionário <strong>${func.nome}</strong>?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.funcService.inativar(func).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Funcionário inativado com sucesso',
          });
           this.buscaFuncionariosDoCliente()
        });
      },
      reject: () => {
      }
    });
  }


  retirarVinculo(vinculo:any, func:FuncionarioResponseDTO, tipoVinculo: 'EMPRESA' | 'FILIAL' | 'SITE'){
    this.confirmationService.confirm({
      message: `Tem certeza de que deseja retirar o vinculo ?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        var funcDTO = this.montaRequestParaDesvincular(func,vinculo,tipoVinculo);
        this.funcService.desvincular(funcDTO).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Vinculo  desfeito com sucesso',
          });
           this.buscaFuncionariosDoCliente()
        });
      },
      reject: () => {
      }
    });
  }

  montaRequestParaDesvincular(func: FuncionarioResponseDTO, vinculo: any, tipoVinculo: String){
    const funcDTO = new DesvincularFuncionarioDTO();

    funcDTO.funcId = func.id;
    funcDTO.idVinculo = vinculo.id;
    funcDTO.tipoVinculo = tipoVinculo;

    return funcDTO;    
  }

  temVinculos(func: any): boolean {
    return (
      (func.listaEmpresas && func.listaEmpresas.length > 0) ||
      (func.listaFilial && func.listaFilial.length > 0) ||
      (func.listaSites && func.listaSites.length > 0)
    );
  }


  abreModalCadastro(): void {
    this.dialogCadastro = true;
  }

  editarFuncionario(funcionario: any) {
    this.funcionarioSelecionado = funcionario;
     this.dialogCadastro = true; 
  }

  fechaModalCadastro(): void {
    this.dialogCadastro = false;
    this.buscaFuncionariosDoCliente();
  }

  toggleRow(func: any): void {
    const key = func.id.toString();
    this.expandedRows[key] = !this.expandedRows[key];
  }

  onRowExpand(event: any): void {
    this.expandedRows[event.data.funcId.toString()] = true;
  }

  onRowCollapse(event: any): void {
    delete this.expandedRows[event.data.funcId.toString()];
  }

}
