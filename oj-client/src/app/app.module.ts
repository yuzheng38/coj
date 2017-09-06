import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { routing } from './app.routes';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { CollaborationService } from './services/collaboration.service';

import { AppComponent } from './app.component';
import { ProblemListComponent } from './components/problem-list/problem-list.component';
import { ProblemDetailComponent } from './components/problem-detail/problem-detail.component';
import { NewProblemComponent } from './components/new-problem/new-problem.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { EditorComponent } from './components/editor/editor.component';

@NgModule({
  declarations: [
    AppComponent,
    ProblemListComponent,
    ProblemDetailComponent,
    NewProblemComponent,
    NavbarComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    routing,
    FormsModule,
    HttpModule
  ],
  providers: [
    {
      provide: 'data',
      useClass: DataService
    },
    AuthService,
    CollaborationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
