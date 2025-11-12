import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UsuarioResponseDTO } from "../dtos/usuario-response-dto";
import { ClienteUpdateRequestDTO } from "../dtos/cliente-request-dto";
import { TrocaSenhaRequestDTO } from "../dtos/troca-senha-request-dto";

@Injectable({
  providedIn: 'root',
})


export class PerfilService {

  private readonly URL_API = `${environment.url_back}perfil`;

  constructor(private http: HttpClient) { }

  buscaDadosUsuario(): Observable<UsuarioResponseDTO> {
    return this.http.get<UsuarioResponseDTO>(`${this.URL_API}`);
  }

  atualizarCliente(dto: ClienteUpdateRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.URL_API}/cliente`, dto);
  }

  trocarSenha(dto: TrocaSenhaRequestDTO) {   
    return this.http.put<void>(`${this.URL_API}/trocar-senha`, dto);
  }

}