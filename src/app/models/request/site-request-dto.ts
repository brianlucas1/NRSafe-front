import { Endereco } from "../endereco";
import { FilialRequestDTO } from "./filial-request-dto";

export class SiteRequestDTO {

    id?: number;
    cnpj?: string
    razaoSocial?: string
    nomeFantasia?: string
    telefone?: string
    email?: string
    endereco?: Endereco
    filial?: FilialRequestDTO
}