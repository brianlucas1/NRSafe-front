import { Endereco } from "../endereco";
import { EmpresaRequestDTO } from "./empresa-request-dto";

export class FilialRequestDTO {

    id?: number;
    cnpj?: string
    razaoSocial?: string
    nomeFantasia?: string
    telefone?: string
    email?: string
    endereco?: Endereco
    empresa?: EmpresaRequestDTO
}