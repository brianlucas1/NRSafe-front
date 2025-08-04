import { Endereco } from "../endereco";
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
}