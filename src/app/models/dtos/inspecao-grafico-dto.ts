import { InspecaoStatusEnum } from "../enums/inspecao-status-enum";

export class GraficoTortaInspecaoDTO{

    statusInspecao?: InspecaoStatusEnum;
    quantidade?: number;
    percentual?: number;
}