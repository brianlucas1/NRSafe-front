export interface AssinaturaPlanoResumoDTO {
  id: number;
  idPlano: number;
  planoNome: string;
  status: string;
  licencasContratadas: number;
  trialAte: string | null;
  dtProxCobranca: string | null;
  precoMensal: number;
}

