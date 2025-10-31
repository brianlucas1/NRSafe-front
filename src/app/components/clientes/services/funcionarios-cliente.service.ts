import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageDTO } from '../../../models/dtos/page-dto';
import { FuncionarioClienteResumoDTO } from '../dtos/funcionario-cliente-resumo-dto';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FuncionariosClienteService {
  private readonly URL_API = `${environment.url_back}funcionarios`;

  constructor(private readonly http: HttpClient) {}

  listarPorCliente(clienteId: number, page = 0, size = 20): Observable<PageDTO<FuncionarioClienteResumoDTO>> {
    return this.http.get<PageDTO<FuncionarioClienteResumoDTO>>(
      `${this.URL_API}/cliente/${clienteId}`,
      { params: { page, size } as any }
    );
  }
}

