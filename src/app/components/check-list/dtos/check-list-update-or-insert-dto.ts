export interface CheckListPerguntaUpsertDTO {
  id?: number;          // se vier vazio => criar; se vier preenchido => atualizar
  pergunta: string;
}