import { Endereco } from "../endereco"

export class FuncionarioRequestDTO {

    nome?: String
    cpf?: String
    email?: String
    telefone?: String
    celular?: String
    rg?: String
    dtNascimento?: Date
    endereco?:Endereco
    filiaisId?:  number[]
    sitesId?:number[]
    empresasId?:number[]
}