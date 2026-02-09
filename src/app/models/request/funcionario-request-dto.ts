import { Endereco } from "../endereco"

export class FuncionarioRequestDTO {

    id?: number
    nome?: String
    cpf?: String
    email?: String
    telefone?: String
    celular?: String
    dtNascimento?: Date
    endereco?:Endereco
    filiaisId?:  number[]
    sitesId?:number[]
    empresasId?:number[]
    idPapelCliente?: number
}
