export interface CheckListPerguntaDTO {
  id: number;
  pergunta: string;
  checkListId: number;               // referencia ao CheckList
  criadoEm: string;                  // ISO
  atualizadoEm: string;              // ISO
  status : 'ATIVO' | 'INATIVO';
}