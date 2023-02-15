import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
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
    BrowserAnimationsModule,
    YouTubePlayerModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatSliderModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatRippleModule,
    MatListModule,
    MatBottomSheetModule,
    DragDropModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
