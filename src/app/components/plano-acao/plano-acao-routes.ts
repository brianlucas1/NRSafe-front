import { Routes } from "@angular/router";
import { InspecoesComponent } from "./pages/inspecoes/inspecoes.component";
import { ItemComponent } from "./pages/items/item.component";
import { VisitasComponent } from "./pages/visitas/visita.component";
import { PlanoAcaoComponent } from "./plano-acao.component";
import { PlanoAcaoContextGuard } from "./services/plano-acao-guard";

export const PLANO_ACAO_ROUTES: Routes = [
  {
    path: '',
    component: PlanoAcaoComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'visitas' },
      { path: 'visitas', component: VisitasComponent },
      { path: 'items', component: ItemComponent, canActivate: [PlanoAcaoContextGuard] },
      { path: 'inspecoes', component: InspecoesComponent, canActivate: [PlanoAcaoContextGuard] }
    ]
  }
];
