export interface   AtualizaSubitemRequestDTO{

  id: number;
  status?: string | null;
  responsavel?: string | null;
  previsao?: Date | null;
  investimento?: number | null;
  multa?: number | null;
  planoAcao?: string | null;
}