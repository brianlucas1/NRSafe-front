import { VisitaStatusEnum } from "../enums/visita-status-enum";

export interface VisitaGraficoDashDTO{

      statusVisita?: VisitaStatusEnum;
        periodo?: number;
        quantidade?: number;
    
}