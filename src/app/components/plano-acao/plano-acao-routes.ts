import { Routes } from "@angular/router";
import {  SubItemNormaComponent } from "./pages/sub-item-norma/sub-item-norma.component";
import { NormasComponent } from "./pages/normas/normas.component";
import { PlanoAcaoComponent } from "./plano-acao.component";
import { VisitasComponent } from "./pages/visitas/visita.component";

export const PLANO_ACAO_ROUTES: Routes = [
  {
    path: '',
    component: PlanoAcaoComponent, // ← ROTA PAI
    children: [
      // ao acessar /plano-acao, vai para /plano-acao/visitas (tela 1)
      { path: '', pathMatch: 'full', redirectTo: 'visitas' },

      { path: 'visitas', component: VisitasComponent },                          // Tela 1
      { path: 'visitas/:idPlanoAcao/normas', component: NormasComponent },          // Tela 2
      { path: 'visitas/:idPlanoAcao/normas/:idPlanoAcaoNorma/itens', component: SubItemNormaComponent } // Tela 3

      // (opcional) outlet nomeado para abrir painel/drawer roteado:
      // { path: 'visitas/:visitaId/editar', outlet: 'panel', component: NormasComponent }
    ]
  }
];