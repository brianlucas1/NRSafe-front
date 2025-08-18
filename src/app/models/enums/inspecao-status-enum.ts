export enum InspecaoStatusEnum{
    NAO_INICIADA = 'NI',
    EM_ANDAMENTO = 'EA',
    CONCLUIDA = 'CL',
}

export function getStatusLabel(status: InspecaoStatusEnum): string {
  switch (status) {
    case InspecaoStatusEnum.EM_ANDAMENTO: return 'Em Andamento';
    case InspecaoStatusEnum.CONCLUIDA: return 'Concluída';
    case InspecaoStatusEnum.NAO_INICIADA: return 'Não Iniciada';
    default: return 'Desconhecido';
  }
}