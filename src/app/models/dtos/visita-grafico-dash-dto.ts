import { VisitaStatusEnum } from "../enums/visita-status-enum";

export interface VisitaGraficoDashDTO {

  statusVisita?: VisitaStatusEnum;
  quantidade?: number;
  periodo?: number;
}