import { AcaoPermissaoEnum } from "../enums/acao-permissao-enum";

export interface PapelClientePermissoesRequestDTO {
  permissoes: AcaoPermissaoEnum[];
}

