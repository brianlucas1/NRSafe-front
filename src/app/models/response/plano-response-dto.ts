import { PlanoRecursoResponseDTO } from "./recurso-response-dto";

export interface PlanoResponseDTO {
    id: number;
    nomePlano: string;
    descPlano: string;
    precoMensal: number;
    
    recurso: PlanoRecursoResponseDTO[];


}