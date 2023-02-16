import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
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
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSliderModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatRippleModule,
    MatListModule,
    DragDropModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
