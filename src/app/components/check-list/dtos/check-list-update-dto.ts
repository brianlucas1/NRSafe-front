import { CheckListPerguntaUpsertDTO } from "./check-list-update-or-insert-dto";

export interface CheckListEditRequestDTO {
  descricao: string;
  perguntas: CheckListPerguntaUpsertDTO[];
}