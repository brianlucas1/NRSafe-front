export interface ClienteUpdateRequestDTO {
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
