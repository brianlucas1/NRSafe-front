import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Endereco } from "../app/models/endereco";

@Injectable({
  providedIn: 'root',
})

export class CorporativoService{

    private readonly URL_API = `${environment.url_back}corporativo`;
    
    constructor(private http: HttpClient) {}

    consultaCep(cep:string):Observable<Endereco>{
        return this.http.get<Endereco>(`${this.URL_API}/cep/${cep}`);      
    }

}