import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { PageResponse } from "../../../models/dtos/page-response";
import { PlanoAcaoResponseDTO } from "../dtos/plano-acao-reponse-dto";
import { NormaResponseDTO } from "../dtos/norma-response-dto";
import { SubItensNormaDTO } from "../dtos/itens-norma-dto";
import { PlanoAcaoSubItemResponseDTO } from "../dtos/plano-acao-sub-item-norma-dto";
import { AssinaturaPlanoAcaoRequestDTO } from "../dtos/request/assinatura-plnao-acao-request-dto";

@Injectable({ providedIn: 'root' })

export class PlanoAcaoService {

  private readonly URL_API = `${environment.url_back}plano-acao`;
  constructor(private http: HttpClient) { }

  // ===========================
  // Núcleo comum (padronização)
  // ===========================

  /** Constrói HttpParams ignorando null/undefined sem ifs espalhados */
  private toHttpParams(qs: Record<string, any>): HttpParams {
    let p = new HttpParams();
    Object.entries(qs).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') p = p.set(k, v as any);
    });
    return p;
  }

  /** GET paginado com padrão (url + objeto de query) */
  private getPage<T>(url: string, qs: Record<string, any>): Observable<PageResponse<T>> {
    const params = this.toHttpParams(qs);
    return this.http.get<PageResponse<T>>(url, { params });
  }

  // ==================================
  // Métodos existentes (compatíveis)
  // ==================================

  // 1) Visitas (já existente) — mantém assinatura
  buscaPlanoAcaoPorfiltro(paramsIn: {
    page: number;
    size: number;
    sort: string;
    idEmpresa: number | null;
    dtInicio: string | null;
    dtFim: string | null;
  }): Observable<PageResponse<PlanoAcaoResponseDTO>> {
    return this.getPage<PlanoAcaoResponseDTO>(`${this.URL_API}/visitas`, {
      page: paramsIn.page,
      size: paramsIn.size,
      sort: paramsIn.sort,
      idEmpresa: paramsIn.idEmpresa,
      dtInicio: paramsIn.dtInicio,
      dtFim: paramsIn.dtFim
    });
  }

  // 2) Normas do plano (já existente) — mantém assinatura
  buscaPlanoAcaoNormas(
    idPlanoAcao: number,
    paramsIn: { page: number; size: number; sort: string; normaId?: number | null; dtInicio?: string | null; dtFim?: string | null; }
  ) {
    return this.getPage<any>(`${this.URL_API}/norma/${idPlanoAcao}`, {
      page: paramsIn.page,
      size: paramsIn.size,
      sort: paramsIn.sort,
      normaId: paramsIn.normaId,
      dtInicio: paramsIn.dtInicio,
      dtFim: paramsIn.dtFim
    });
  }

  // 3) Inspeções — mantém a assinatura que você já tinha declarada
  //    (nota: o endpoint real usa /inspecao/{normaId} e aceita subItemId opcional;
  //     dtInicio/dtFim serão enviados se vierem, o back atual pode ignorar sem quebrar)
  buscaPlanoAcaoInspecao(
    idPlanoAcaoNorma: number,
    params:
      {
        normaId: any;
        dtInicio: string | null;
        dtFim: string | null;
        page: number;
        size: number;
        sort: string;
        subItemId?: number | null;
      }
  ): Observable<PageResponse<PlanoAcaoSubItemResponseDTO>> {
    return this.getPage<PlanoAcaoSubItemResponseDTO>(`${this.URL_API}/inspecao/${idPlanoAcaoNorma}`, {
      page: params.page,
      size: params.size,
      sort: params.sort,
      subItemId: params.subItemId,
      dtInicio: params.dtInicio,
      dtFim: params.dtFim
    });
  }

  buscaNormasPorIdPlanoAcao(idPlanoAcao: number): Observable<NormaResponseDTO[]> {
    return this.http.get<NormaResponseDTO[]>(`${this.URL_API}/busca-normas/${idPlanoAcao}`);
  }

  buscaSubItensNorma(idPlanoAcaoNorma: number) {
    return this.http.get<SubItensNormaDTO[]>(`${this.URL_API}/busca-item-norma/${idPlanoAcaoNorma}`);
  }

  buscaTotaisPlanos(filtros: { idEmpresa: number | null; dtInicio: string | null; dtFim: string | null; }) {
    const params = this.toHttpParams(filtros);
    return this.http.get<{ totalInvestimento: number; totalMulta: number }>(`${this.URL_API}/totais`, { params });
  }


  atualizaPlanoAcaoSubItem(idPlanoAcaoNorma: number,
    body: Array<{ id: number; status?: string | null; comentario?: string | null; planoAcao?: string | null; }>) {
    return this.http.patch(`${this.URL_API}/atualiza-inspecao/${idPlanoAcaoNorma}`, body);
  }

  assinarNorma(planoId: number, payload: AssinaturaPlanoAcaoRequestDTO): Observable<void> {

    return this.http.post<void>(`${this.URL_API}/assinar/${planoId}`, payload);
  }
}