import { VisitaStatusEnum } from "../enums/visita-status-enum";

export const VisitaStatusLabel: Record<VisitaStatusEnum, string> = {
  [VisitaStatusEnum.EM_ANDAMENTO]: 'Em Andamento',
  [VisitaStatusEnum.CONCLUIDA]: 'Concluída',
  [VisitaStatusEnum.AGENDADA]: 'Agendada',
  [VisitaStatusEnum.CANCELADA]: 'Cancelada',
  [VisitaStatusEnum.ATRASADA]: 'Atrasada'
};