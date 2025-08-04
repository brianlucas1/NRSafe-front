export interface  JwtResponse { 
    accessToken?:string
    refreshToken?:string
    expiresIn?:number
    roles?: string[]
    idCliente:number
    nomeCliente:string
}