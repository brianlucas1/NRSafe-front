import { InspecaoStatusEnum } from "../enums/inspecao-status-enum";

export interface InspecaoGraficoDashDTO {
      statusVisita?: InspecaoStatusEnum;
      quantidade?: number;
      periodo?: number;
}