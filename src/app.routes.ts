import { Routes } from '@angular/router';
import { LoginComponent } from './app/components/login/login.component';
import { HomeComponent } from './app/components/home/home.component';
import { AuthGuard } from './services/auth/auth-gaurd';
import { ClientesComponent } from './app/components/clientes/clientes.component';
import { ResetSenhaComponent } from './app/components/login/reset-senha/reset-senha.component';
import { EsqueceuSenhaComponent } from './app/components/login/esqueceu-senha/esqueceu-senha.component';
import { EmpresasComponent } from './app/components/empresas/empresas.component';
import { FiliaisComponent } from './app/components/filiais/filiais.component';
import { SitesComponent } from './app/components/sites/sites.component';
import { FuncionarioComponent } from './app/components/funcionario/funcionario.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { ListaCheckListComponent } from './app/components/check-list/pages/lista/lista.component';
import { VisualizarPerfilComponent } from './app/components/perfil/pages/visualizar-perfil/visualizar-perfil.component';


export const appRoutes: Routes = [
 { path: 'login', component: LoginComponent },
  { 
    path: 'home', 
    component: HomeComponent, 
    canActivate: [AuthGuard] 
  },
   { 
    path: 'clientes', 
    component: ClientesComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'perfil', 
    component: VisualizarPerfilComponent, 
    canActivate: [AuthGuard] 
  },
   { 
    path: 'check-list', 
    component: ListaCheckListComponent, 
    canActivate: [AuthGuard] 
  },
  { 
       path: 'plano-acao',
    loadChildren: () =>
      import('./app/components/plano-acao/plano-acao-routes').then(m => m.PLANO_ACAO_ROUTES)
  },
  { path: '', pathMatch: 'full', redirectTo: 'plano-acao'   }
  ,
   { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
   { 
    path: 'empresas', 
    component: EmpresasComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'funcionarios', 
    component: FuncionarioComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'filiais', 
    component: FiliaisComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'sites', 
    component: SitesComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'esqueceu-senha', 
    component: EsqueceuSenhaComponent, 
  },
  { 
    path: 'reset-senha', 
    component: ResetSenhaComponent, 
  },
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
 
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];