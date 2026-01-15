export interface JwtResponse {
  accessToken?: string;
  expiresIn?: number;
  roles?: string[];
  permissoes?: string[];
  loggedUserLabel?: string;
  clienteUser?: boolean;
  assinaturaAtiva?: boolean;
}
