import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLoginComponent } from './components/spmo_components/spmo-login/admin-login.component';
import { SpmoDashboardComponent } from './components/spmo_components/spmo-dashboard/spmo-dashboard.component';
import { LoginComponent } from './components/pages/login/login.component';

import { SpmoSidenavComponent } from './components/spmo_components/spmo-sidenav/spmo-sidenav.component';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';


import { AuthInterceptor } from './guards/auth.interceptor';


import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { JsonParsePipe } from './pipes/json-parse.pipe';
import { MatSelectModule } from '@angular/material/select';

import { SpmoAssetsComponent } from './components/spmo_components/spmo-assets/spmo-assets.component';
import { SpmoShowAssetsComponent } from './components/spmo_components/spmo-assets/spmo-show-assets/spmo-show-assets.component';
import { AdmWasteComponent } from './components/spmo_components/spmo-waste/adm-waste.component';
import { ForgotPasswordComponent } from './components/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/pages/reset-password/reset-password.component';
import { PagesRegisterComponent } from './components/pages/pages-register/pages-register.component';
import { AppInitService } from '../services/app-init.service';
import { SpmoAddEditAssetsComponent } from './components/spmo_components/spmo-assets/spmo-add-edit-assets/spmo-add-edit-assets.component';
import { AdminSettingsComponent } from './components/admin_components/admin-settings/admin-settings.component';

export function initializeApp(
  appInitService: AppInitService
): () => Promise<void> {
  return () => appInitService.loadConfig();
}
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SpmoSidenavComponent,
    SpmoDashboardComponent,
    AdminLoginComponent,
    SpmoAssetsComponent,
    SpmoShowAssetsComponent,
    SpmoAddEditAssetsComponent,
    AdmWasteComponent,
 
    ForgotPasswordComponent,
    ResetPasswordComponent,
    PagesRegisterComponent,
    AdminSettingsComponent,
  

    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    //Auth
    OAuthModule.forRoot(),
    HttpClientModule,
    //Material
    MatSelectModule,
    NgSelectModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule, 
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    ToastrModule.forRoot({
        timeOut: 1000,
        extendedTimeOut: 1000,
        closeButton: true,
        progressBar: true,
        progressAnimation: 'increasing',
        positionClass: 'toast-top-center',
    }),
    JsonParsePipe,
    MatOption,
      MatTabsModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  MatCheckboxModule,
  ReactiveFormsModule,
  MatDialogModule
],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitService],
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
