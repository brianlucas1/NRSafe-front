export interface PlanoAcaoItemResponseDTO {
  
    id: number;
    idNorma: number;
    nrNorma: string;
    descNorma: string;
    status: string;
    dtHrAtualizacao: string;
    dtHrCriacao: string;
    multa:number
    investimento:number

    statusPlanoAcao?: string;

}