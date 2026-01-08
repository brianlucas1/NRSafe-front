import { Endereco } from "../endereco"

export interface ClienteRequestDTO{

    cnpj:string
    razaoSocial:string
    nomeFantasia:string
    email:string
    telefone:string
    celular:string
    nome:string
    cpf?: String
    endereco:Endereco
   
}