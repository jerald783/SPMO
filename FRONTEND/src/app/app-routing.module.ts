import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/pages/login/login.component';
import { SpmoSidenavComponent } from './components/spmo_components/spmo-sidenav/spmo-sidenav.component';
import { SpmoDashboardComponent } from './components/spmo_components/spmo-dashboard/spmo-dashboard.component';
import { SpmoAssetsComponent } from './components/spmo_components/spmo-assets/spmo-assets.component';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guards';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { AdmWasteComponent } from './components/spmo_components/spmo-waste/adm-waste.component';

import { ResetPasswordComponent } from './components/pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/pages/forgot-password/forgot-password.component';
import { PagesRegisterComponent } from './components/pages/pages-register/pages-register.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
{ path:'forgot-password', component:ForgotPasswordComponent },
{ path:'reset-password', component:ResetPasswordComponent },
{path: 'pages-register', component: PagesRegisterComponent},
  // { path: 'spmo', component: AdminLoginComponent },



  //spmo routes
    {
    path: 'adminspmo',
    canActivate: [RoleGuard],
    data: { expectedRole: 'SPMO' },
    component: SpmoSidenavComponent,
    children: [
      { path: '', component: SpmoSidenavComponent },
     { path: 'dashboard', component: SpmoDashboardComponent, outlet: 'secondary' },
      { path: 'spmoassets', component: SpmoAssetsComponent, outlet: 'secondary' },
      

    ],
  },
  // {
  //   path: 'spmo',
  //   canActivate: [RoleGuard],
  //   data: { expectedRole: 'Admin' },
  //   component: SidenavComponent,
  //   children: [
  //     { path: '', component: SidenavComponent },
  //     { path: 'dashboard', component: DashboardComponent, outlet: 'secondary' },
  //     { path: 'Assets', component: AdmAssetsComponent, outlet: 'secondary' },
  //     { path: 'waste', component: AdmWasteComponent, outlet: 'secondary' },
  //     {
  //       path: 'admin-register',
  //       component: ShowRegComponent,
  //       outlet: 'secondary',
  //     },
  //   ],
  // },

  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy },],
  
})
export class AppRoutingModule {}
