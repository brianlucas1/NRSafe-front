import { Endereco } from "../endereco";
import { EmpresaRequestDTO } from "./empresa-request-dto";
import { FilialRequestDTO } from "./filial-request-dto";

export class SiteRequestDTO {

    id?: number;
    cnpj?: string
    razaoSocial?: string
    telefone?: string
    email?: string
    endereco?: Endereco
    filial?: FilialRequestDTO
    empresa?: EmpresaRequestDTO
}
