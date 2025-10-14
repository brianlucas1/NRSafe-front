import { Endereco } from "../endereco"

export interface ClienteRequestDTO{

    cnpj:string
    razaoSocial:string
    nomeFantasia:string
    email:string
    telefone:string
    nome:string
    cpf?: String
    endereco:Endereco
    planoId:number
    billingCycle?: 'MENSAL' | 'ANUAL' 
}