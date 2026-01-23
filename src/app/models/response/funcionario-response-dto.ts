import { AcessoDTO } from "../dtos/acesso-dto"
import { Endereco } from "../endereco"
import { EmpresaResponseDTO } from "./empresa-reponse-dto"
import { FilialResponseDTO } from "./filial-reponse-dto"
import { SiteResponseDTO } from "./site-reponse-dto"

export class FuncionarioResponseDTO{
    
    id?:number
    nome?:string
    email?:string
    cpf?:string
    stAtivo?:string
    perfil?:string
    telefone?:string
    celular?:string
    dtNascimento?:Date
    endereco?: Endereco

    listaEmpresas:EmpresaResponseDTO[] = []
    listaFilial:FilialResponseDTO[] = []
    listaSites:SiteResponseDTO[] = []
}
