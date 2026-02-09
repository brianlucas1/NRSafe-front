export interface CheckoutPagamentoResponseDTO {
  checkoutUrl: string;
  correlationId: string;
  idLinkProvedor: string;
  idCobrancaProvedor: string;
  statusCobranca: string;
  statusProvedor: string;
}
