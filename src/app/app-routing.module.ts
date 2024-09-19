import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UploadComponent } from './pages/upload/upload.component';
import { HomeComponent } from './pages/home/home.component';
import { IdentificarComponent } from './pages/identificar/identificar.component';
import { DeteccionComponent } from './pages/deteccion/deteccion.component';


const routes:Routes=[

  {path: 'home', component:HomeComponent},
  {path: 'upload', component:UploadComponent},
  {path: 'identificar', component:IdentificarComponent},
  {path: 'deteccion', component:DeteccionComponent},

  {path:'', pathMatch:'full', redirectTo:'home'},
  {path:'**', pathMatch:'full', redirectTo:'home'}

]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
  ],
  exports:[RouterModule]
})
export class AppRoutingModule { }
