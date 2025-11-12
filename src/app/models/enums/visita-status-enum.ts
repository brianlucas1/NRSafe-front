export enum VisitaStatusEnum {
  EM_ANDAMENTO = 'EA',
  CONCLUIDA = 'CL',
  AGENDADA = 'AG',
  CANCELADA = 'CA',
  ATRASADA = 'AT'


}


export function getStatusLabel(status: VisitaStatusEnum): string {
  switch (status) {
    case VisitaStatusEnum.EM_ANDAMENTO: return 'Em Andamento';
    case VisitaStatusEnum.CONCLUIDA: return 'Concluída';
    case VisitaStatusEnum.AGENDADA: return 'Agendada';
    case VisitaStatusEnum.CANCELADA: return 'Cancelada';
    case VisitaStatusEnum.ATRASADA: return 'Atrasada';
    default: return 'Desconhecido';
  }
}