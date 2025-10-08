import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../environments/environment";
import { AuthStorageService } from "./auth/auth-storage-service";

import { EmailRequestDTO } from "../app/models/request/email-request-dto";
import { ResponseStringDTO } from "../app/models/response/string-response-dto";
import { ClienteService } from "./cliente-service";

@Injectable({
    providedIn: 'root'
})
export class LoginSerivce {

    constructor(
        private http: HttpClient,
        private storage: AuthStorageService,
        private clienteService: ClienteService
    ) { }

    esqueceuSenha(emailRequest: EmailRequestDTO) {
        return this.http.post(environment.url_back + 'login/recupera-senha', emailRequest)
    }

    resetaSenha(redefinirSenhaDTO: any): Observable<ResponseStringDTO> {
        return this.http.post<ResponseStringDTO>(environment.url_back + 'login/redefinir-senha', redefinirSenhaDTO)
    }


}