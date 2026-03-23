import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ClienteService } from '../../../../../services/cliente-service';
import { AcaoPermissaoEnum } from '../../../../models/enums/acao-permissao-enum';
import { PapelClienteResponseDTO } from '../../../../models/response/papel-cliente-response-dto';
import { StandaloneImports } from '../../../../util/standalone-imports';

@Component({
  selector: 'app-permissoes',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './permissoes.component.html',
  styleUrl: './permissoes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class PermissoesComponent implements OnInit {
  loading = false;
  papeis: PapelClienteResponseDTO[] = [];

  readonly colunas: { key: AcaoPermissaoEnum; label: string }[] = [
    { key: AcaoPermissaoEnum.VISUALIZAR, label: 'Visualizar' },
    { key: AcaoPermissaoEnum.CADASTRAR, label: 'Cadastrar' },
    { key: AcaoPermissaoEnum.EDITAR, label: 'Editar' },
    { key: AcaoPermissaoEnum.EXCLUIR, label: 'Excluir' },
    { key: AcaoPermissaoEnum.BAIXAR, label: 'Baixar' }
  ];

  constructor(
    private readonly clienteService: ClienteService,
    private readonly msg: MessageService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPapeis();
  }

  hasPerm(p: PapelClienteResponseDTO, acao: AcaoPermissaoEnum): boolean {
    return this.normalizarPermissoes(p.permissoes || []).includes(acao);
  }

  togglePerm(papel: PapelClienteResponseDTO, acao: AcaoPermissaoEnum, checked: boolean): void {
    const set = new Set(this.normalizarPermissoes(papel.permissoes || []));
    if (checked) {
      set.add(acao);
    } else {
      set.delete(acao);
    }
    papel.permissoes = Array.from(set) as AcaoPermissaoEnum[];
  }

  salvarLinha(papel: PapelClienteResponseDTO): void {
    papel.permissoes = this.normalizarPermissoes(papel.permissoes || []);
    this.loading = true;
    this.clienteService.atualizarPermissoes(papel.id!, papel.permissoes).subscribe({
      next: (resp) => {
        papel.permissoes = this.normalizarPermissoes(resp.permissoes || []);
        this.msg.add({ severity: 'success', summary: 'Sucesso', detail: `Permissoes atualizadas para ${papel.nome}` });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar permissoes' });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  salvarTudo(): void {
    this.loading = true;
    const seq = [...this.papeis];
    const proximo = () => {
      const p = seq.shift();
      if (!p) {
        this.loading = false;
        this.cdr.markForCheck();
        this.msg.add({ severity: 'success', summary: 'Sucesso', detail: 'Permissoes atualizadas' });
        return;
      }

      p.permissoes = this.normalizarPermissoes(p.permissoes || []);
      this.clienteService.atualizarPermissoes(p.id!, p.permissoes).subscribe({
        next: () => proximo(),
        error: () => {
          this.msg.add({ severity: 'error', summary: 'Erro', detail: `Falha ao salvar ${p.nome}` });
          proximo();
        }
      });
    };

    proximo();
  }

  private carregarPapeis(): void {
    this.loading = true;
    this.clienteService.listarPapeis().subscribe({
      next: (dados) => {
        this.papeis = (dados ?? []).map((papel) => ({
          ...papel,
          permissoes: this.normalizarPermissoes(papel.permissoes || [])
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.papeis = [];
        this.loading = false;
        this.msg.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar permissoes' });
        this.cdr.markForCheck();
      }
    });
  }

  private normalizarPermissoes(permissoes: ReadonlyArray<AcaoPermissaoEnum | string>): AcaoPermissaoEnum[] {
    const normalizadas = (permissoes || []).map((permissao) =>
      String(permissao).toUpperCase() === 'CONSULTAR' ? AcaoPermissaoEnum.VISUALIZAR : (permissao as AcaoPermissaoEnum)
    );
    return Array.from(new Set(normalizadas));
  }
}
