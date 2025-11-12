import { VisitaStatusEnum } from "../enums/visita-status-enum";

export class VisitaPercentualDashDTO {
    
    statusVisita?: VisitaStatusEnum;
    quantidade?: number;
    percentual?: number;
}