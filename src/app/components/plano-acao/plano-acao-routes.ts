import { Routes } from "@angular/router";
import {  SubItemNormaComponent } from "./pages/sub-item-norma/sub-item-norma.component";
import { NormasComponent } from "./pages/normas/normas.component";
import { PlanoAcaoComponent } from "./plano-acao.component";
import { VisitasComponent } from "./pages/visitas/visita.component";

export const PLANO_ACAO_ROUTES: Routes = [
  {
    path: '',
    component: PlanoAcaoComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'visitas' },
      { path: 'visitas', component: VisitasComponent },
      { path: 'normas', component: NormasComponent },     // ← sem id
      { path: 'itens', component: SubItemNormaComponent } // ← sem id
    ]
  }
];
