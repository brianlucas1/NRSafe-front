import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import { FilialResponseDTO } from "../app/models/response/filial-reponse-dto";
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

    atualizarSite(id: number, dto: any) {
        // PUT completo (alinha com buildPayloadFromForm)
        return this.http.put(`${this.URL_API}/${id}`, dto);
    }

    inativarSite(idSite: number): Observable<void> {
        return this.http.delete<void>(this.URL_API + `/inativar/${idSite}`);
    }


}