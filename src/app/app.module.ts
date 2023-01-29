import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';

import { YoutubePlayerComponent } from './components/youtube-player/youtube-player.component';
import { RequestBoxComponent } from './components/request-box/request-box.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { RequestDialogComponent } from './components/request-dialog/request-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    YoutubePlayerComponent,
    RequestBoxComponent,
    TopBarComponent,
    RequestDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    YouTubePlayerModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatButtonModule,
    MatSliderModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    DragDropModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
