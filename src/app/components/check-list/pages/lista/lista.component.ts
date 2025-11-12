import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { debounceTime, Subject } from 'rxjs';
import { CheckListService } from '../../services/check-list-service';
import { CheckListReponseListDTO } from '../../dtos/check-list-resumo-dto';
import { PageDTO } from '../../../../models/dtos/page-dto';
import { CadastroCheckListComponent, ChecklistFormResult } from '../cadastro/cadastro.component';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-lista',
  imports: [StandaloneImports,CadastroCheckListComponent,DrawerModule ],
  providers: [MessageService,ConfirmationService],
   standalone: true,
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaCheckListComponent {

  readonly items = signal<CheckListReponseListDTO[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);


  pageIndex = 0;
  pageSize = 50;
  sortField = 'descricao';
  sortOrder: 1 | -1 = 1;

  searchTerm = signal('');
  private search$ = new Subject<string>();

  dialogCadastro = signal(false);
  idCheckList: number | null = null;

 
  constructor(
    private readonly svc: CheckListService,
    private confirmationService: ConfirmationService,
    private readonly toast: MessageService
  ) {
    this.search$.pipe(debounceTime(300)).subscribe(q => {
      this.searchTerm.set(q ?? '');
      this.pageIndex = 0;
      this.load();
    });
    this.load();
  }

  onLazyLoad(event: any) {
    if (typeof event.first === 'number' && typeof event.rows === 'number') {
      this.pageIndex = Math.floor(event.first / event.rows);
      this.pageSize = event.rows;
    }
    if (event.sortField) this.sortField = event.sortField;
    if (event.sortOrder) this.sortOrder = event.sortOrder;
    this.load();
  }

  load() {
    this.loading.set(true);
    const sort = `${this.sortField},${this.sortOrder === 1 ? 'asc' : 'desc'}`;
    this.svc.listar(this.pageIndex, this.pageSize, this.searchTerm(), sort).subscribe({
      next: (page: PageDTO<CheckListReponseListDTO>) => {
        this.items.set(page.content);
        this.total.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar checklists' });
        this.loading.set(false);
      }
    });
  }


    fechaDialog() {
    this.dialogCadastro.set(false);
  }

   openCreate() {
    this.idCheckList = null;
    this.dialogCadastro.set(true);
  }

  editarcheckList(row: CheckListReponseListDTO) {
    this.idCheckList = row.id;
    this.dialogCadastro.set(true);
  }

  onSearchInput(evt: Event) {
  const q = (evt.target as HTMLInputElement)?.value ?? '';
  this.search$.next(q);
}

   onFormSubmit(res: ChecklistFormResult) {
    this.toast.add({ severity: 'success', summary: 'Sucesso', detail: res.message });
    this.dialogCadastro.set(false);
    this.load();
  }

  deletar(row: CheckListReponseListDTO) {
   
    this.confirmationService.confirm({
      message: `Tem certeza de que deseja inativar/ativar esse checkList ?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.inativar(row).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Excluído', detail: 'Checklist removido' });
        this.load();
      },
      error: (e) => {
        this.toast.add({ severity: 'error', summary: 'Erro', detail: e?.error?.message ?? 'Não foi possível excluir' });
      }
            });
      },
    });
  }

  trackById = (_: number, it: CheckListReponseListDTO) => it.id;
}
