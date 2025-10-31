export interface DisponibilidadeLicencaDTO {
  usados: number;
  contratadas: number | null;
  disponiveis: number | null;
  statusAssinatura: string;
  trialAte: string | null;
}

