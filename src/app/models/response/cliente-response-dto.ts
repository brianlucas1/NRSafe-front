import { Endereco } from "../endereco";

export class ClienteResponseDTO{

    id?:number;
	cnpj?:string	
	razaoSocial?:string	
	telefone?:string	
	email?:string	
	enderecoDTO?: Endereco
	    
}