import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PapelClienteResponseDTO } from '../../../../models/response/papel-cliente-response-dto';
import { AcaoPermissaoEnum } from '../../../../models/enums/acao-permissao-enum';
import { MessageService } from 'primeng/api';
import { StandaloneImports } from '../../../../util/standalone-imports';
import { ClienteService } from '../../../../../services/cliente-service';

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
    { key: AcaoPermissaoEnum.CONSULTAR, label: 'Consultar' },
    { key: AcaoPermissaoEnum.CADASTRAR, label: 'Cadastrar' },
    { key: AcaoPermissaoEnum.EDITAR, label: 'Editar' },
    { key: AcaoPermissaoEnum.EXCLUIR, label: 'Excluir' },
    { key: AcaoPermissaoEnum.BAIXAR, label: 'Baixar' },
  ];

  constructor(
    private readonly clienteService: ClienteService,
    private readonly msg: MessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarPapeis();
  }

  hasPerm(p: PapelClienteResponseDTO, acao: AcaoPermissaoEnum): boolean {
    return (p.permissoes || []).includes(acao);
  }

  togglePerm(papel: PapelClienteResponseDTO, acao: AcaoPermissaoEnum, checked: boolean) {
    const set = new Set(papel.permissoes || []);
    if (checked) set.add(acao); else set.delete(acao);
    papel.permissoes = Array.from(set);
  }

  salvarLinha(papel: PapelClienteResponseDTO) {
    this.loading = true;
    this.clienteService
      .atualizarPermissoes(papel.id!, papel.permissoes || [])
      .subscribe({
        next: (resp) => {
          papel.permissoes = resp.permissoes || [];
          this.msg.add({ severity: 'success', summary: 'Sucesso', detail: `Permissões atualizadas para ${papel.nome}` });
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.msg.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar permissões' });
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  salvarTudo() {
    // salva sequencialmente todos os papeis
    this.loading = true;
    const seq = [...this.papeis];
    const proximo = () => {
      const p = seq.shift();
      if (!p) { this.loading = false; this.cdr.markForCheck(); this.msg.add({severity:'success', summary:'Sucesso', detail:'Permissões atualizadas'}); return; }
      this.clienteService.atualizarPermissoes(p.id!, p.permissoes || []).subscribe({
        next: () => proximo(),
        error: () => { this.msg.add({severity:'error', summary:'Erro', detail:`Falha ao salvar ${p.nome}`}); proximo(); }
      });
    };
    proximo();
  }

  private carregarPapeis() {
    this.loading = true;
    this.clienteService.listarPapeis().subscribe({
      next: (dados) => { this.papeis = dados ?? []; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.papeis = []; this.loading = false; this.msg.add({severity:'error', summary:'Erro', detail:'Falha ao carregar permissões'}); this.cdr.markForCheck(); }
    });
  }
}

