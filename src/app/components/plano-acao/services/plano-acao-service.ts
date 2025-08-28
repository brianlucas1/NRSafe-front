import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { PageResponse } from "../../../models/dtos/page-response";
import { PlanoAcaoResponseDTO } from "../dtos/plano-acao-reponse-dto";
import { NormaResponseDTO } from "../dtos/norma-response-dto";

@Injectable({
  providedIn: 'root',
})

export class PlanoAcaoService {

   buscaPlanoAcaoNormas(
    idPlanoAcao: number,
    paramsIn: { page: number; size: number; sort: string; normaId?: number | null; dtInicio?: string | null; dtFim?: string | null; }
  ) {
    let params = new HttpParams()
      .set('page', paramsIn.page)
      .set('size', paramsIn.size)
      .set('sort', paramsIn.sort);

    if (paramsIn.normaId != null) params = params.set('normaId', paramsIn.normaId);
    if (paramsIn.dtInicio)        params = params.set('dtInicio', paramsIn.dtInicio);
    if (paramsIn.dtFim)           params = params.set('dtFim', paramsIn.dtFim);

    return this.http.get<{ content: any[]; totalElements: number }>(
      `${this.URL_API}/norma/${idPlanoAcao}`,
      { params }
    );
  }


  buscaNormasPorIdPlanoAcao(idPlanoAcao: number): Observable<NormaResponseDTO[]> {
   return this.http.get<NormaResponseDTO[]>(`${this.URL_API}/busca-normas/${idPlanoAcao}`);
  }


  private readonly URL_API = `${environment.url_back}plano-acao`;

  constructor(private http: HttpClient) { }
  buscaPlanoAcaoPorfiltro(paramsIn: {
    page: number;
    size: number;
    sort: string;
    idEmpresa: number | null;
    dtInicio: string | null;
    dtFim: string | null;
  }): Observable<PageResponse<PlanoAcaoResponseDTO>> {
    let params = new HttpParams()
      .set('page', paramsIn.page)
      .set('size', paramsIn.size)
      .set('sort', paramsIn.sort);

    if (paramsIn.idEmpresa !== null) params = params.set('idEmpresa', paramsIn.idEmpresa);
    if (paramsIn.dtInicio) params = params.set('dtInicio', paramsIn.dtInicio);
    if (paramsIn.dtFim) params = params.set('dtFim', paramsIn.dtFim);

    return this.http.get<PageResponse<PlanoAcaoResponseDTO>>(this.URL_API+'/visitas', { params });
  }

  buscaTotaisPlanos(filtros: {
    idEmpresa: number | null;
    dtInicio: string | null;
    dtFim: string | null;
  }) {
    let params = new HttpParams();
    if (filtros.idEmpresa !== null) params = params.set('idEmpresa', filtros.idEmpresa);
    if (filtros.dtInicio) params = params.set('dtInicio', filtros.dtInicio);
    if (filtros.dtFim) params = params.set('dtFim', filtros.dtFim);

    return this.http.get<{ totalInvestimento: number; totalMulta: number }>(this.URL_API + '/totais', { params });
  }

}