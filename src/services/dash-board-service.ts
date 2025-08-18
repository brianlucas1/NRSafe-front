import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";
import { VisitaPercentualDashDTO } from "../app/models/dtos/visita-percentual-dash-dto";
import { VisitaGraficoDashDTO } from "../app/models/dtos/visita-grafico-dash-dto";
import { DadosTabelaVisitaDTO } from "../app/models/dtos/visita-grafico-empresa-dto";
import { GraficoTortaInspecaoDTO } from "../app/models/dtos/inspecao-grafico-dto";
import { InspecaoGraficoDashDTO } from "../app/models/dtos/inspecao-grafico-dash-dto";

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

    return this.http.get<VisitaPercentualDashDTO[]>(`${this.URL_API}/visita-torta-filtro`, { params });
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

    return this.http.get<VisitaGraficoDashDTO[]>(`${this.URL_API}/visita-grafico-filtro`, { params });
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
    return this.http.get<DadosTabelaVisitaDTO[]>(`${this.URL_API}/visita-tabela-filtro`, { params });
  }


    buscaDadosInspecaoTortaPercentual(filtros: {
    idFilial?: number;
    idSite?: number;
    idEmpresa?: number;
    dtInicio?: string;
    dtFim?: string;
  }): Observable<GraficoTortaInspecaoDTO[]> {
    let params = new HttpParams();

    if (filtros.idEmpresa != null) params = params.set('idEmpresa', filtros.idEmpresa.toString());
    if (filtros.idFilial != null) params = params.set('idFilial', filtros.idFilial.toString());
    if (filtros.idSite != null) params = params.set('idSite', filtros.idSite.toString());
    if (filtros.dtInicio) params = params.set('dtInicio', filtros.dtInicio);
    if (filtros.dtFim) params = params.set('dtFim', filtros.dtFim);

    return this.http.get<GraficoTortaInspecaoDTO[]>(`${this.URL_API}/inspecao-torta-filtro`, { params });
  }


  buscaDadosInspecaoGraficoPercentual(filtros: {
    idFilial?: number;
    idSite?: number;
    idEmpresa?: number;
    dtInicio?: string;
    dtFim?: string;
  }): Observable<InspecaoGraficoDashDTO[]> {
    let params = new HttpParams();

    if (filtros.idEmpresa != null) params = params.set('idEmpresa', filtros.idEmpresa.toString());
    if (filtros.idFilial != null) params = params.set('idFilial', filtros.idFilial.toString());
    if (filtros.idSite != null) params = params.set('idSite', filtros.idSite.toString());
    if (filtros.dtInicio) params = params.set('dtInicio', filtros.dtInicio);
    if (filtros.dtFim) params = params.set('dtFim', filtros.dtFim);

    return this.http.get<InspecaoGraficoDashDTO[]>(`${this.URL_API}/inspecao-grafico-filtro`, { params });
  }


    buscaDadosTabelaInspecao(filtros: {
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
    return this.http.get<DadosTabelaVisitaDTO[]>(`${this.URL_API}/inspecao-tabela-filtro`, { params });
  }
}