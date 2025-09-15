import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map, shareReplay } from "rxjs";
import { environment } from "../../../../environments/environment";
import { PageDTO } from "../../../models/dtos/page-dto";
import { CheckListDTO } from "../dtos/check-list-dto";
import { CheckListRequestDTO } from "../dtos/check-list-request-dto";
import { CheckListReponseListDTO } from "../dtos/check-list-resumo-dto";
import { CheckListEditRequestDTO } from "../dtos/check-list-update-dto";

@Injectable({
  providedIn: 'root',
})

@Injectable({ providedIn: 'root' })
export class CheckListService {

  private readonly URL_API = `${environment.url_back}check-lists`;

  private http = inject(HttpClient);

  /**
   * Lista paginada de CheckList filtrando por “pergunta” (server-side).
   * O backend deve aceitar: page, size, sort, searchPergunta
   */
  listar(
    page = 0,
    size = 10,
    searchPergunta = '',
    sort = 'descricao,asc'
  ): Observable<PageDTO<CheckListReponseListDTO>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    if (searchPergunta?.trim()) {
      params = params.set('searchPergunta', searchPergunta.trim());
    }

    return this.http.get<PageDTO<CheckListReponseListDTO>>(this.URL_API, { params }).pipe(
      // fallback para backends que ainda não retornam Page “padrão”
      map((res: any) => ({
        content: res.content ?? res.items ?? [],
        totalElements: res.totalElements ?? res.total ?? (res.content?.length ?? 0),
        page: res.page ?? page,
        size: res.size ?? size,
        totalPages: res.totalPages ?? undefined,
      }))
    );
  }

  /** Busca um CheckList completo (com ou sem perguntas, conforme o back retornar) */
  buscarPorId(id: number): Observable<CheckListDTO> {
    return this.http.get<CheckListDTO>(`${this.URL_API}/${id}`).pipe(shareReplay(1));
  }

  /** Cria um CheckList (e suas perguntas) */
  criar(payload: CheckListRequestDTO): Observable<CheckListDTO> {
    return this.http.post<CheckListDTO>(this.URL_API, payload);
  }

/** Atualiza um CheckList (inclui/edita/remove perguntas via upsert) */
atualizar(id: number, payload: CheckListEditRequestDTO): Observable<CheckListDTO> {
  return this.http.put<CheckListDTO>(`${this.URL_API}/${id}`, payload);
}

  /** Exclui um CheckList */
  inativar(dto: CheckListReponseListDTO): Observable<void> {
    return this.http.put<void>(`${this.URL_API}/inativar`, dto);
  }

  inativarPergunta(idPergunta: number): Observable<void> {
    return this.http.put<void>(`${this.URL_API}/inativar-pergunta/${idPergunta}`, {});
  }

}