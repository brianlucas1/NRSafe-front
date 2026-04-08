export interface AtualizaSubitemRequestDTO {
  id: number;
  status?: string | null;
  responsavel?: string | null;
  /** Formato enviado ao backend: 'yyyy-MM-dd' (compativel com LocalDate). */
  previsao?: string | null;
  investimento?: number | null;
  multa?: number | null;
  planoAcao?: string | null;
}
