export interface AssinaturaPlanoResumoDTO{

    id: number;
    idPlano: number;
    planoNome: string;
    status:String;
    licencasContratadas:number;
    trialAte: Date;
    dtProximoCobranca: Date;
    precoMensal: number;

}