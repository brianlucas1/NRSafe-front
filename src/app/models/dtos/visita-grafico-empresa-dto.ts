export interface DadosTabelaVisitaDTO {


    empresaId: number
    empresaNome: string
    totais: { [periodo: string]: number };
}