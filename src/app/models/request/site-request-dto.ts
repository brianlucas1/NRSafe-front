import { EmpresaRequestDTO } from "./empresa-request-dto";
import { FilialRequestDTO } from "./filial-request-dto";

export class SiteRequestDTO {

    id?: number;
    razaoSocial?: string
    telefone?: string
    email?: string
    filial?: FilialRequestDTO
    empresa?: EmpresaRequestDTO
}
