import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";
import { VisitaPercentualDashDTO } from "../app/models/dtos/visita-percentual-dash-dto";
import { VisitaGraficoDashDTO } from "../app/models/dtos/visita-grafico-dash-dto";
import { DadosTabelaVisitaDTO } from "../app/models/dtos/visita-grafico-empresa-dto";

@Injectable({
    providedIn: 'root',
})

export class DashBoardService {

    private readonly URL_API = `${environment.url_back}dash`;

    constructor(private http: HttpClient) { }

 
  buscaDadosVisitaTortaPercentual(filtros: {
    idFilial?: number;
    idSite?: number;
    idEmpresa?: number;
    dtInicio?: string;
    dtFim?: string;
  }): Observable<VisitaPercentualDashDTO[]> {
   let params = new HttpParams();
    
    if (filtros.idEmpresa != null) params = params.set('idEmpresa', filtros.idEmpresa.toString());
    if (filtros.idFilial != null) params = params.set('idFilial', filtros.idFilial.toString());
    if (filtros.idSite != null) params = params.set('idSite', filtros.idSite.toString());
    if (filtros.dtInicio) params = params.set('dtInicio', filtros.dtInicio);
    if (filtros.dtFim) params = params.set('dtFim', filtros.dtFim);

    return this.http.get<VisitaPercentualDashDTO[]>(`${this.URL_API}/torta-filtro`, { params });
  }

    buscaDadosVisitaGraficoPercentual(filtros: {
    idFilial?: number;
    idSite?: number;
    idEmpresa?: number;
    dtInicio?: string;
    dtFim?: string;
  }): Observable<VisitaGraficoDashDTO[]> {
   let params = new HttpParams();
    
    if (filtros.idEmpresa != null) params = params.set('idEmpresa', filtros.idEmpresa.toString());
    if (filtros.idFilial != null) params = params.set('idFilial', filtros.idFilial.toString());
    if (filtros.idSite != null) params = params.set('idSite', filtros.idSite.toString());
    if (filtros.dtInicio) params = params.set('dtInicio', filtros.dtInicio);
    if (filtros.dtFim) params = params.set('dtFim', filtros.dtFim);

    return this.http.get<VisitaGraficoDashDTO[]>(`${this.URL_API}/grafico-filtro`, { params });
  }

  buscaDadosTabelaVisita(filtros: {
    idFilial?: number;
    idSite?: number;
    idEmpresa?: number;
    dtInicio?: string;
    dtFim?: string;
  }): Observable<DadosTabelaVisitaDTO[]> {
    let params = new HttpParams();
    
    if (filtros.idEmpresa != null) params = params.set('idEmpresa', filtros.idEmpresa.toString());
    if (filtros.idFilial != null) params = params.set('idFilial', filtros.idFilial.toString());
    if (filtros.idSite != null) params = params.set('idSite', filtros.idSite.toString());
    if (filtros.dtInicio) params = params.set('dtInicio', filtros.dtInicio);
    if (filtros.dtFim) params = params.set('dtFim', filtros.dtFim);
    return this.http.get<DadosTabelaVisitaDTO[]>(`${this.URL_API}/tabela-filtro`,{ params });
  }

}