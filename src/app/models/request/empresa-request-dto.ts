import { Endereco } from "../endereco";

export class EmpresaRequestDTO {


    id?: number;
    cnpj?: string
    razaoSocial?: string
    nomeFantasia?: string
    telefone?: string
    email?: string
    endereco?: Endereco
    empresa?: EmpresaRequestDTO

}