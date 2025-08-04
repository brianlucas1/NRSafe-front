import { Endereco } from "../endereco";
import { FilialResponseDTO } from "./filial-reponse-dto";

export class EmpresaResponseDTO{

        id?:number;
        cnpj?:string	
        razaoSocial?:string	
        nomeFantasia?:string
        telefone?:string	
        email?:string	
        enderecoDTO?: Endereco
        listaFilial?: FilialResponseDTO[];
        stAtivo?: string    

}