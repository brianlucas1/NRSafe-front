import { Endereco } from "../endereco";
import { EmpresaResponseDTO } from "./empresa-reponse-dto";
import { SiteResponseDTO } from "./site-reponse-dto";

export class FilialResponseDTO {

    id?: number;
    cnpj?: string
    razaoSocial?: string
    nomeFantasia?:string
    telefone?: string
    email?: string
    enderecoDTO?: Endereco
    listaSites?: SiteResponseDTO[]
    stAtivo?: string
    empresaVinculada?: EmpresaResponseDTO;

}