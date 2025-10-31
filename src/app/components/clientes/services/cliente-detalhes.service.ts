import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClienteDetalhesResponseDTO } from '../dtos/cliente-detalhes-response-dto';

@Injectable({ providedIn: 'root' })
export class ClienteDetalhesService {
  private readonly URL_API = `${environment.url_back}clientes`;

  constructor(private readonly http: HttpClient) {}

  buscarResumoCliente(clienteId: number): Observable<ClienteDetalhesResponseDTO> {
    return this.http.get<ClienteDetalhesResponseDTO>(`${this.URL_API}/${clienteId}/detalhes`, { withCredentials: true });
  }
}

