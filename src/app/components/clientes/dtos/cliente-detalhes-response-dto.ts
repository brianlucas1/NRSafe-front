import { ClienteResponseDTO } from '../../../models/response/cliente-response-dto';
import { AssinaturaPlanoResumoDTO } from './assinatura-plano-resumo-dto';
import { DisponibilidadeLicencaDTO } from './disponibilidade-licenca-dto';

export interface ClienteDetalhesResponseDTO {
  cliente: ClienteResponseDTO;
  quantidadeUsuarios: number;
  quantidadeEmpresas: number;
  planoAtual: AssinaturaPlanoResumoDTO | null;
  licencas: DisponibilidadeLicencaDTO | null;
}
