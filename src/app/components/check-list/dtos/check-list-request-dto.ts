import { CheckListPerguntaRequestDTO } from "./check-list-pergunta-request-dto";

export interface CheckListRequestDTO {
  descricao: string;
  perguntas: CheckListPerguntaRequestDTO[]; // lista de perguntas
}