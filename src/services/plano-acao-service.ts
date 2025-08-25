import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";
import { PageResponse } from "../app/models/dtos/page-response";
import { planoAcaoResponseDTO } from "../app/models/dtos/plano-acao-reponse-dto";

@Injectable({
  providedIn: 'root',
})

export class PlanoAcaoService {

  private readonly URL_API = `${environment.url_back}plano-acao`;

  constructor(private http: HttpClient) { }
  buscaPlanoAcaoPorfiltro(paramsIn: {
    page: number;
    size: number;
    sort: string;
    idEmpresa: number | null;
    dtInicio: string | null;
    dtFim: string | null;
  }): Observable<PageResponse<planoAcaoResponseDTO>> {
    let params = new HttpParams()
      .set('page', paramsIn.page)
      .set('size', paramsIn.size)
      .set('sort', paramsIn.sort);

    if (paramsIn.idEmpresa !== null) params = params.set('idEmpresa', paramsIn.idEmpresa);
    if (paramsIn.dtInicio) params = params.set('dtInicio', paramsIn.dtInicio);
    if (paramsIn.dtFim) params = params.set('dtFim', paramsIn.dtFim);

    return this.http.get<PageResponse<planoAcaoResponseDTO>>(this.URL_API, { params });
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