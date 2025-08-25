export interface planoAcaoResponseDTO {
  id: number;
  visitaId: number;
  status: string;           // 'AB' | 'EA' | 'CO' | 'CA'
  totalInvestimento: number;
  totalMulta: number;
  dthrCriacao: string;         // ISO
  idVisita: number;
  nomeVisita: string;
}