import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable, tap } from "rxjs";
import { ClienteRequestDTO } from "../app/models/request/cliente-request-dto";
import { ClienteResponseDTO } from "../app/models/response/cliente-response-dto";
import { PageDTO } from "../app/models/dtos/page-dto";
import { ClienteListResponseDTO } from "../app/models/response/cliente-list-response-dto";

@Injectable({
  providedIn: 'root',
})
export class ClienteService{

  private readonly URL_API = `${environment.url_back}clientes`;

  constructor(private http: HttpClient) {}

     cadastrarCliente(cliente:ClienteRequestDTO){
        return this.http.post(this.URL_API+'/cadastro', cliente ) 
     }

     // Lista paginada (novo endpoint)
     buscaClientes(page = 0, size = 10): Observable<PageDTO<ClienteListResponseDTO>>{
      return this.http.get<PageDTO<ClienteListResponseDTO>>(this.URL_API, { params: { page, size } as any });
     }

     // Legacy: manter assinatura antiga se houver outros usos
     buscaTodosClientes(): Observable<ClienteResponseDTO[]>{
      return this.http.get<ClienteResponseDTO[]>(this.URL_API);
     }

}
