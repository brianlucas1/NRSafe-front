import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";
import { VisitaPercentualDashDTO } from "../app/models/dtos/visita-percentual-dash-dto";

@Injectable({
    providedIn: 'root',
})

export class DashBoardService {

    private readonly URL_API = `${environment.url_back}dash`;

    constructor(private http: HttpClient) { }


 
  buscaDadosVisitaPercentual(filtros: {
    idFilial?: number;
    idSite?: number;
    empresaIds?: number;
    dataInicio?: string;
    dataFim?: string;
  }): Observable<VisitaPercentualDashDTO[]> {
   let params = new HttpParams();
    
    if (filtros.empresaIds != null) params = params.set('empresaIds', filtros.empresaIds.toString());
    if (filtros.idFilial != null) params = params.set('idFilial', filtros.idFilial.toString());
    if (filtros.idSite != null) params = params.set('idSite', filtros.idSite.toString());
    if (filtros.dataInicio) params = params.set('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params = params.set('dataFim', filtros.dataFim);

    return this.http.get<VisitaPercentualDashDTO[]>(`${this.URL_API}/visitas-filtro`, { params });
  }

}