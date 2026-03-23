import { Injectable } from '@angular/core';
import { Observable, of, map, switchMap, tap } from 'rxjs';
import { AssinaturaHistoricoResponseDTO } from '../../../models/dtos/assinatura-historico-response-dto';
import { PageDTO } from '../../../models/dtos/page-dto';
import { ResumoAssinaturaResponseDTO } from '../../../models/dtos/resumo-assinatura-response-dto';
import { HistoricoFaturaResponseDTO } from '../../../models/dtos/historico-fatura-response-dto';
import { AtividadeContaResponseDTO } from '../../../models/dtos/atividade-conta-response-dto';
import { LinkPagamentoFaturaResponseDTO } from '../../../models/dtos/link-pagamento-fatura-response-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PerfilService } from '../../perfil/services/perfil-service';
import { AssinaturaService } from '../../../../services/assinatura-service';

@Injectable({
  providedIn: 'root'
})
export class PagamentoHistoricoService {
  private readonly URL_API = `${environment.url_back}pagamentos/historico`;
  private clienteIdCache: number | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly perfilService: PerfilService,
    private readonly assinaturaService: AssinaturaService
  ) {}

  buscarResumoAssinatura(): Observable<ResumoAssinaturaResponseDTO> {
    return this.obterClienteId().pipe(
      switchMap((clienteId) =>
        this.http.get<ResumoAssinaturaResponseDTO>(`${this.URL_API}/${clienteId}/resumo-assinatura`)
      )
    );
  }

  buscarHistoricoFaturas(page = 0, size = 10): Observable<PageDTO<HistoricoFaturaResponseDTO>> {
    return this.obterClienteId().pipe(
      switchMap((clienteId) =>
        this.http.get<PageDTO<HistoricoFaturaResponseDTO>>(`${this.URL_API}/${clienteId}/faturas`, {
          params: { page, size } as any
        })
      )
    );
  }

  buscarLinkPagamentoFaturaEmAtraso(): Observable<LinkPagamentoFaturaResponseDTO> {
    return this.obterClienteId().pipe(
      switchMap((clienteId) =>
        this.http.get<LinkPagamentoFaturaResponseDTO>(`${this.URL_API}/${clienteId}/faturas/link-pagamento`)
      )
    );
  }

  buscarAtividadesConta(page = 0, size = 10): Observable<PageDTO<AtividadeContaResponseDTO>> {
    return this.obterClienteId().pipe(
      switchMap((clienteId) =>
        this.http.get<PageDTO<AtividadeContaResponseDTO>>(`${this.URL_API}/${clienteId}/atividades`, {
          params: { page, size } as any
        })
      )
    );
  }

  buscarHistorico(page = 0, size = 10): Observable<PageDTO<AssinaturaHistoricoResponseDTO>> {
    return this.obterClienteId().pipe(
      switchMap((clienteId) => this.assinaturaService.buscarHistoricoPorCliente(clienteId, page, size))
    );
  }

  private obterClienteId(): Observable<number> {
    if (this.clienteIdCache !== null) {
      return of(this.clienteIdCache);
    }

    return this.perfilService.buscaDadosUsuario().pipe(
      map((usuario) => {
        const id = Number(usuario?.cliente?.id);
        if (!Number.isFinite(id) || id <= 0) {
          throw new Error('Cliente nao identificado para carregar historico de pagamento.');
        }
        return id;
      }),
      tap((id) => {
        this.clienteIdCache = id;
      })
    );
  }
}
