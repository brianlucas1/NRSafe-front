import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import {  FilialResponseDTO } from "../app/models/response/filial-reponse-dto";
import { FilialRequestDTO } from "../app/models/request/filial-request-dto";

@Injectable({
    providedIn: 'root',
})

export class FilialService {

    private readonly URL_API = `${environment.url_back}filiais`;

    constructor(private http: HttpClient) { }

    cadastrarFilial(filial: FilialRequestDTO) {
        return this.http.post(this.URL_API + '/cadastro', filial)
    }

    buscaTodasFiliaisPorCliente(): Observable<any[]> {
        return this.http.get<any[]>(this.URL_API+'/por-cliente');
    }

      buscaTodasFiliais(): Observable<any[]> {
        return this.http.get<any[]>(this.URL_API);
    }

    inativarFilial(filial:FilialResponseDTO){
        return this.http.put(this.URL_API + '/inativar', filial)
    }

    atualizarFilial(filial: FilialRequestDTO){
         return this.http.put(this.URL_API + '/atualizar', filial)
    }

    buscaFilialPorEmpresa(empresa:any){
      return this.http.put(this.URL_API + '/atualizar', empresa)

    }

}