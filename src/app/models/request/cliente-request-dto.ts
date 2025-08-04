import { Endereco } from "../endereco"

export interface ClienteRequestDTO{

    cnpj:string
    razaoSocial:string
    nomeFantasia:string
    email:string
    telefone:string
    endereco:Endereco
}