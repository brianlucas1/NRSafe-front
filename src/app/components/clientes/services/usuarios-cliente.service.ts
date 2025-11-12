import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageDTO } from '../../../models/dtos/page-dto';
import { UsuarioClienteResumoDTO } from '../dtos/usuario-cliente-resumo-dto';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosClienteService {
  // Ajuste a URL conforme backend final
  private readonly URL_API = `${environment.url_back}clientes`;

  constructor(private readonly http: HttpClient) {}

  listar(clienteId: number, page = 0, size = 10): Observable<PageDTO<UsuarioClienteResumoDTO>> {
    return this.http.get<PageDTO<UsuarioClienteResumoDTO>>(
      `${this.URL_API}/${clienteId}/usuarios`,
      { params: { page, size } as any }
    );
  }

  inativar(usuarioId: number): Observable<void> {
    return this.http.put<void>(`${environment.url_back}usuarios/${usuarioId}/alternar-ativo`, {});
  }
}

