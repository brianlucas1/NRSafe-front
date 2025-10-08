import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../environments/environment";
import { PlanoResponseDTO } from "../app/models/response/plano-response-dto";


@Injectable({
    providedIn: 'root'
})
export class PlanoService {

    private readonly URL_API = `${environment.url_back}plano`;


    constructor(
        private http: HttpClient
        ) { }

   buscarTodosPlanosAtivos():Observable<PlanoResponseDTO[]>{
         return this.http.get<PlanoResponseDTO[]>(this.URL_API + '/ativos')
    }


}