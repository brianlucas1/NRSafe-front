export interface ResumoAssinaturaResponseDTO {
  assinaturaPlanoId: number;
  planoId: number;
  planoNome: string;
  statusAssinatura: string;
  statusCobranca: string;
  dataProximaCobranca: string;
  valor: number;
  tipoPlano: string;
}
