export interface JwtResponse {
  accessToken?: string;
  expiresIn?: number;
  roles?: string[];
  loggedUserLabel?: string;
}
