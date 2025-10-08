import { Routes } from "@angular/router";
import {  InspecoesComponent } from "./pages/inspecoes/inspecoes.component";

import { PlanoAcaoComponent } from "./plano-acao.component";
import { VisitasComponent } from "./pages/visitas/visita.component";
import { ItemComponent } from "./pages/items/item.component";

export const PLANO_ACAO_ROUTES: Routes = [
  {
    path: '',
    component: PlanoAcaoComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'visitas' },
      { path: 'visitas', component: VisitasComponent },
      { path: 'items', component: ItemComponent },     // ← sem id
      { path: 'inspecoes', component: InspecoesComponent } // ← sem id
    ]
  }
];
