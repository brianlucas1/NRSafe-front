import { CheckListPerguntaDTO } from "./check-list-pergunta-dto";

export interface CheckListDTO {
  id: number;
  descricao: string;
  clienteId: number;                 // referencia ao Cliente (ManyToOne)
  criadoEm: string;                  // ISO
  atualizadoEm: string;              // ISO
  perguntas?: CheckListPerguntaDTO[]; // opcionalmente expandido
}