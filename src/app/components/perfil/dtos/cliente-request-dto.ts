export interface ClienteUpdateRequestDTO {
  id: number; 
  telefone: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    localidade: string;
    bairro: string;
    uf: string;
  };
}
