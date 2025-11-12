import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CheckListService } from '../../services/check-list-service';
import { take } from 'rxjs';
import { CheckListDTO } from '../../dtos/check-list-dto';
import { CheckListPerguntaRequestDTO } from '../../dtos/check-list-pergunta-request-dto';
import { CheckListRequestDTO } from '../../dtos/check-list-request-dto';
import { LoadingService } from '../../../../util/loading-service';

type PerguntaFG = FormGroup<{
  id: FormControl<number | null>; // novo!
  pergunta: FormControl<string>;
  status: FormControl<'ATIVO' | 'INATIVO'>;
}>;

type FormFG = FormGroup<{
  descricao: FormControl<string>;
  perguntas: FormArray<PerguntaFG>;
}>;

export interface ChecklistFormResult {
  id?: number;
  message: string;
}

@Component({
  selector: 'app-cadastro',
  imports: [StandaloneImports],
  standalone: true,
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService],
})

export class CadastroCheckListComponent {

  private fb = inject(FormBuilder);
  private svc = inject(CheckListService);
  private loadingService = inject(LoadingService);
  private toast = inject(MessageService);

  constructor(
    private confirmationService: ConfirmationService,
  ) {

  }

  @Input() editingId: number | null = null;
  @Output() submitted = new EventEmitter<ChecklistFormResult>();
  @Output() cancelled = new EventEmitter<void>();

  readonly form: FormFG = this.fb.nonNullable.group({
    descricao: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.minLength(3)], updateOn: 'blur' }),
    perguntas: this.fb.array<PerguntaFG>([], { validators: [this.minPerguntas(2)] }),
  }, { updateOn: 'blur' });

  salvando = false;

  ngOnInit() {
    if (this.perguntasFA.length === 0) this.adicionarPergunta();

    if (this.editingId != null) {
      this.buscarChecklist(this.editingId);
    }
  }
  
  private buscarChecklist(id: number) {
    this.loadingService.show();
      this.svc.buscarPorId(id).pipe(take(1))
        .subscribe({
          next: (data: CheckListDTO) => {
            this.form.controls.descricao.setValue(data.descricao ?? '');
            while (this.perguntasFA.length) this.perguntasFA.removeAt(0);
            (data.perguntas ?? []).forEach(p =>
              this.adicionarPergunta(p.pergunta, p.status ?? 'ATIVO', p.id ?? null)
            );
            if (this.perguntasFA.length === 0) this.adicionarPergunta();
            this.loadingService.hide();
          },
          error: () => {
            this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar checklist' })
          }
        });
    }
  

  get perguntasFA(): FormArray<PerguntaFG> { return this.form.controls.perguntas; }

  novaPerguntaGroup(valor = '', status: 'ATIVO' | 'INATIVO' = 'ATIVO', id: number | null = null): PerguntaFG {
    return this.fb.nonNullable.group({
      id: this.fb.nonNullable.control(id),
      pergunta: this.fb.nonNullable.control(valor, { validators: [Validators.required, Validators.minLength(3)], updateOn: 'blur' }),
      status: this.fb.nonNullable.control(status)
    });
  }

  adicionarPergunta(valor = '', status: 'ATIVO' | 'INATIVO' = 'ATIVO', id: number | null = null) {
    this.perguntasFA.push(this.novaPerguntaGroup(valor, status, id));
  }

  inativarPergunta(dto: any) {
    this.confirmationService.confirm({
      message: `Tem certeza de que deseja inativar/ativar essa Pergunta ?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.inativarPergunta(dto.value.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Pergunta inativada/ativada com sucesso!' });
            this.cancelar();
          },
          error: (e) => {
            this.toast.add({ severity: 'error', summary: 'Erro', detail: e?.error?.message ?? 'Não foi possível excluir' });
          }
        });
      },
    });
  }

  cancelar() { this.cancelled.emit(); }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: 'Validação', detail: 'Preencha a descrição e ao menos 1 pergunta.' });
      return;
    }

    const perguntas: CheckListPerguntaRequestDTO[] = this.perguntasFA.controls
      .map(c => ({ pergunta: (c.value.pergunta ?? '').trim() }))
      .filter(p => !!p.pergunta);

    const payload: CheckListRequestDTO = {
      descricao: this.form.value.descricao!.trim(),
      perguntas
    };

    this.salvando = true;
    const req$ = this.editingId == null ? this.svc.criar(payload) : this.svc.atualizar(this.editingId, payload);

    req$.pipe(take(1)).subscribe({
      next: (res) => {
        this.submitted.emit({ id: res?.id ?? this.editingId ?? undefined, message: this.editingId == null ? 'Checklist cadastrado!' : 'Checklist atualizado!' });
        this.salvando = false;
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: this.editingId == null ? 'Checklist cadastrado!' : 'Checklist atualizado!' });
        this.form.reset();
        while (this.perguntasFA.length) this.perguntasFA.removeAt(0);
        this.adicionarPergunta();
      },
      error: (e) => {
        this.salvando = false;
        this.toast.add({ severity: 'error', summary: 'Erro', detail: e?.error?.message ?? 'Falha ao salvar' });
      }
    });
  }

  private minPerguntas(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fa = control as FormArray<PerguntaFG>;
      const count = fa.controls.reduce((acc, fg) => {
        const v = (fg.controls.pergunta.value ?? '').trim();
        return acc + (v.length > 0 ? 1 : 0);
      }, 0);
      return count >= min ? null : { minPerguntas: { min, atual: count } };
    };
  }
  trackByIndex = (i: number) => i;
}
