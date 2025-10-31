import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import { EmpresaResponseDTO } from "../app/models/response/empresa-reponse-dto";
import { EmpresaRequestDTO } from "../app/models/request/empresa-request-dto";
import { PageDTO } from "../app/models/dtos/page-dto";
import { EmpresaClienteResumoDTO } from "../app/components/clientes/dtos/empresa-cliente-resumo-dto";

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

    listarPorCliente(clienteId: number, page = 0, size = 10): Observable<PageDTO<EmpresaClienteResumoDTO>> {
        return this.http.get<PageDTO<EmpresaClienteResumoDTO>>(
            `${this.URL_API}/cliente/${clienteId}`,
            { params: { page, size } as any }
        );
    }

    inativarEmpresa(empresa: EmpresaRequestDTO){
        return this.http.put(this.URL_API + '/inativar', empresa)
    }

    atualizar(empresa: EmpresaRequestDTO){
        return this.http.put(this.URL_API + '/atualizar', empresa)
    }

}
