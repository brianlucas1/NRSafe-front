import { Endereco } from "../endereco";
import { EmpresaResponseDTO } from "./empresa-reponse-dto";
import { FilialResponseDTO } from "./filial-reponse-dto";

export class SiteResponseDTO {

    id?: number;
    cnpj?: string
    razaoSocial?: string
    telefone?: string
    email?: string
    enderecoDTO?: Endereco
    nomeFantasia?: string
    stAtivo?: string
    filialVinculada?: FilialResponseDTO
    empresaVinculada?: EmpresaResponseDTO
}