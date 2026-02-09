import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";
import { DisponibilidadeLicencaDTO } from "../app/models/dtos/disponibilidade-licenca-dto";
import { AssinaturaPlanoResumoDTO } from "../app/models/dtos/assinatura-plano-resumo-dto";
import { TrocaPlanoRequestDTO } from "../app/components/perfil/dtos/troca-plano-request-dto";
import { PageDTO } from "../app/models/dtos/page-dto";
import { AssinaturaHistoricoResponseDTO } from "../app/models/dtos/assinatura-historico-response-dto";
import { CheckoutPagamentoResponseDTO } from "../app/models/dtos/checkout-pagamento-response-dto";


@Injectable({
    providedIn: 'root',
})
export class AssinaturaService {

  
    private readonly URL_API = `${environment.url_back}assinaturas`;

    constructor(private http: HttpClient) { }

    trocarPlano(trocaPlanoDTO: TrocaPlanoRequestDTO): Observable<CheckoutPagamentoResponseDTO> {
        return this.http.post<CheckoutPagamentoResponseDTO>(this.URL_API + '/trocar-plano', trocaPlanoDTO);
    }


    buscaQuantidadeLicencas(): Observable<DisponibilidadeLicencaDTO> {
        return this.http.get<DisponibilidadeLicencaDTO>(this.URL_API + '/licencas/disponibilidade');
    }

    buscaAssinaturaAtual(): Observable<AssinaturaPlanoResumoDTO> {
        {
            return this.http.get<AssinaturaPlanoResumoDTO>(this.URL_API + '/atual');
        }

    }

    buscarHistoricoPorCliente(clienteId: number, page = 0, size = 10): Observable<PageDTO<AssinaturaHistoricoResponseDTO>> {
        return this.http.get<PageDTO<AssinaturaHistoricoResponseDTO>>(
            `${this.URL_API}/${clienteId}/historico`,
            { params: { page, size } as any }
        );
    }
}
