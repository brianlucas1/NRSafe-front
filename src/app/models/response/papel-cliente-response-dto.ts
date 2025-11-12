import { AcaoPermissaoEnum } from "../enums/acao-permissao-enum";

export interface PapelClienteResponseDTO {
  id: number;
  nome: string;
  codigo: string;
  descricao: string;
  ativo: boolean;
  recurso: string;
  permissoes: AcaoPermissaoEnum[]; // backend returns Set -> JSON array
  dataHoraCadastro: string; // ISO string
  dataHoraAlteracao: string; // ISO string
}

