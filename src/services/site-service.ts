import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import {  FilialResponseDTO } from "../app/models/response/filial-reponse-dto";
import { SiteRequestDTO } from "../app/models/request/site-request-dto";
import { SiteResponseDTO } from "../app/models/response/site-reponse-dto";

@Injectable({
    providedIn: 'root',
})


export class SiteService {
    
    private readonly URL_API = `${environment.url_back}sites`;

    constructor(private http: HttpClient) { }

    cadastrarSite(site: SiteRequestDTO) {
        return this.http.post(this.URL_API + '/cadastro', site)
    }

    buscaTodosSites(): Observable<SiteResponseDTO[]> {
        return this.http.get<SiteResponseDTO[]>(this.URL_API);
    }

}