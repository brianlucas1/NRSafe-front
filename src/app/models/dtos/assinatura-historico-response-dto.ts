export interface AssinaturaHistoricoResponseDTO {
  id: number;
  clienteId: number;
  planoAnteriorId: number | null;
  planoAnteriorNome: string | null;
  planoAtualId: number | null;
  planoAtualNome: string | null;
  prorrataValor: number | null;
  prorrataTipo: string | null;
  dataEvento: string; // ISO string
}

