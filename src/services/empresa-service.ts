import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ClienteRequestDTO } from "../app/models/request/cliente-request-dto";
import { ClienteResponseDTO } from "../app/models/response/cliente-response-dto";
import { environment } from "../environments/environment";
import { EmpresaResponseDTO } from "../app/models/response/empresa-reponse-dto";
import { EmpresaRequestDTO } from "../app/models/request/empresa-request-dto";

@Injectable({
    providedIn: 'root',
})

export class EmpresaService {

    private readonly URL_API = `${environment.url_back}empresas`;

    constructor(private http: HttpClient) { }

    cadastrarEmpresa(empresa: EmpresaRequestDTO) {
        return this.http.post(this.URL_API + '/cadastro', empresa)
    }

    buscaTodasEmpresas(): Observable<EmpresaResponseDTO[]> {
        return this.http.get<EmpresaResponseDTO[]>(this.URL_API);
    }

    inativarEmpresa(empresa: EmpresaRequestDTO){
        return this.http.put(this.URL_API + '/inativar', empresa)
    }

    atualizar(empresa: EmpresaRequestDTO){
        return this.http.put(this.URL_API + '/atualizar', empresa)
    }

}