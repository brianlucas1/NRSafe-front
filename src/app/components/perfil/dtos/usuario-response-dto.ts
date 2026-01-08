import { ClienteResponseDTO } from "../../../models/response/cliente-response-dto";
import { FuncionarioResponseDTO } from "../../../models/response/funcionario-response-dto";

export interface UsuarioResponseDTO{

    idUsuario: number;
    email: string;
    role: string;
    funcionario:FuncionarioResponseDTO;
    cliente: ClienteResponseDTO;

}