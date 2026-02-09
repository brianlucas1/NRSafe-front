export interface   AtualizaSubitemRequestDTO{

  id: number;
  status?: string | null;
  responsavel?: string | null;
  /** Formato enviado ao backend: tipicamente 'dd-MM-yyyy' (compatível com endpoints Java LocalDate) */
  previsao?: string | null;
  investimento?: number | null;
  multa?: number | null;
  planoAcao?: string | null;
}
