import { InspecaoStatusEnum } from "../enums/inspecao-status-enum";

export const InspecaoStatusLabel: Record<InspecaoStatusEnum, string> = {
  [InspecaoStatusEnum.EM_ANDAMENTO]: 'Em Andamento',
  [InspecaoStatusEnum.CONCLUIDA]: 'Concluída',
  [InspecaoStatusEnum.NAO_INICIADA]: 'Não Iniciada',

};