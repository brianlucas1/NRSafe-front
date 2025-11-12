import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable, tap } from "rxjs";
import { ClienteRequestDTO } from "../app/models/request/cliente-request-dto";
import { ClienteResponseDTO } from "../app/models/response/cliente-response-dto";
import { PageDTO } from "../app/models/dtos/page-dto";
import { ClienteListResponseDTO } from "../app/models/response/cliente-list-response-dto";
import { PapelClienteResponseDTO } from "../app/models/response/papel-cliente-response-dto";
import { AcaoPermissaoEnum } from "../app/models/enums/acao-permissao-enum";
import { PapelClientePermissoesRequestDTO } from "../app/models/request/papel-cliente-permissoes-request-dto";

@Injectable({
  providedIn: 'root',
})
export class ClienteService{

  private readonly URL_API = `${environment.url_back}clientes`;

  constructor(private http: HttpClient) {}

     cadastrarCliente(cliente:ClienteRequestDTO){
        return this.http.post(this.URL_API+'/cadastro', cliente ) 
     }

     // Lista paginada com ordenação e busca
     buscaClientes(page = 0, size = 10, sort: string = 'razaoSocial,asc', search?: string): Observable<PageDTO<ClienteListResponseDTO>>{
      const params: any = { page, size, sort };
      if (search && search.trim().length) params.search = search.trim();
      return this.http.get<PageDTO<ClienteListResponseDTO>>(this.URL_API, { params });
     }

     // Legacy: manter assinatura antiga se houver outros usos
     buscaTodosClientes(): Observable<ClienteResponseDTO[]>{
      return this.http.get<ClienteResponseDTO[]>(this.URL_API);
     }

     // Lista papéis do cliente autenticado
     listarPapeis(): Observable<PapelClienteResponseDTO[]> {
      return this.http.get<PapelClienteResponseDTO[]>(`${this.URL_API}/papeis`);
     }

     // Atualiza permissões de um papel do cliente
     atualizarPermissoes(papelId: number, permissoes: AcaoPermissaoEnum[])
       : Observable<PapelClienteResponseDTO> {
       const body: PapelClientePermissoesRequestDTO = { permissoes };
       return this.http.put<PapelClienteResponseDTO>(
         `${this.URL_API}/papeis/${papelId}/permissoes`,
         body
       );
     }

}
