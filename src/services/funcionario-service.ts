import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ClienteRequestDTO } from "../app/models/request/cliente-request-dto";
import { ClienteResponseDTO } from "../app/models/response/cliente-response-dto";
import { environment } from "../environments/environment";
import { EmpresaResponseDTO } from "../app/models/response/empresa-reponse-dto";
import { EmpresaRequestDTO } from "../app/models/request/empresa-request-dto";
import { FuncionarioRequestDTO } from "../app/models/request/funcionario-request-dto";
import { FuncionarioResponseDTO } from "../app/models/response/funcionario-response-dto";
import { DesvincularFuncionarioDTO } from "../app/models/request/funcionario-desvincular-dto";

@Injectable({
    providedIn: 'root',
})

export class FuncionarioService {

    private readonly URL_API = `${environment.url_back}funcionarios`;

    constructor(private http: HttpClient) { }

    cadastrarFuncionario(func: FuncionarioRequestDTO) {
        return this.http.post(this.URL_API + '/cadastro', func)
    }

    buscaFuncionariosPorCliente():Observable <FuncionarioResponseDTO[]>{
        return this.http.get<FuncionarioResponseDTO[]>(this.URL_API + `/por-cliente`);
    }

    inativar(func:FuncionarioResponseDTO){
        return this.http.put(this.URL_API + `/inativar`,func);
    }

    desvincular(funcDTO: DesvincularFuncionarioDTO){
        return this.http.put(this.URL_API + `/desvincular`,funcDTO);
    }

    atualizar(func: FuncionarioRequestDTO){
         return this.http.put(this.URL_API + `/atualizar`,func);
    }

}