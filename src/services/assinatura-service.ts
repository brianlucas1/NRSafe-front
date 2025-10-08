import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";
import { DisponibilidadeLicencaDTO } from "../app/models/dtos/disponibilidade-licenca-dto";
import { AssinaturaPlanoResumoDTO } from "../app/models/dtos/assinatura-plano-resumo-dto";
import { TrocaPlanoRequestDTO } from "../app/components/perfil/dtos/troca-plano-request-dto";


@Injectable({
    providedIn: 'root',
})
export class AssinaturaService {

  
    private readonly URL_API = `${environment.url_back}assinaturas`;

    constructor(private http: HttpClient) { }

    trocarPlano(trocaPlanoDTO: TrocaPlanoRequestDTO): Observable<void> {
        return this.http.post<void>(this.URL_API + '/trocar-plano', trocaPlanoDTO);
    }


    buscaQuantidadeLicencas(): Observable<DisponibilidadeLicencaDTO> {
        return this.http.get<DisponibilidadeLicencaDTO>(this.URL_API + '/licencas/disponibilidade');
    }

    buscaAssinaturaAtual(): Observable<AssinaturaPlanoResumoDTO> {
        {
            return this.http.get<AssinaturaPlanoResumoDTO>(this.URL_API + '/atual');
        }

    }
}