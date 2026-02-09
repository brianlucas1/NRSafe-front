import { EmpresaResponseDTO } from "./empresa-reponse-dto";
import { FilialResponseDTO } from "./filial-reponse-dto";

export class SiteResponseDTO {

    id?: number;
    razaoSocial?: string
    telefone?: string
    email?: string
    stAtivo?: string
    filialVinculada?: FilialResponseDTO
    empresaVinculada?: EmpresaResponseDTO
}
