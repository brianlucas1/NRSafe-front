export interface HistoricoFaturaResponseDTO {
  id: number;
  vencimento: string;
  valor: number;
  status: string;
  emAtraso: boolean;
}
