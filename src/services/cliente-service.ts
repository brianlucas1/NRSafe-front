import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable, tap } from "rxjs";
import { ClienteRequestDTO } from "../app/models/request/cliente-request-dto";
import { ClienteResponseDTO } from "../app/models/response/cliente-response-dto";

@Injectable({
  providedIn: 'root',
})
export class ClienteService{

  private readonly URL_API = `${environment.url_back}clientes`;

  constructor(private http: HttpClient) {}

     cadastrarCliente(cliente:ClienteRequestDTO){
        return this.http.post(this.URL_API+'/cadastro', cliente ) 
     }

     buscaTodosClientes(): Observable<ClienteResponseDTO[]>{
      return this.http.get<ClienteResponseDTO[]>(this.URL_API);
     }

     buscaClienteLogado():Observable<ClienteResponseDTO>{
      return this.http.get<ClienteResponseDTO>(this.URL_API+'/logado');
     }

}