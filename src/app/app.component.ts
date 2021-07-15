import { Component, ViewChild } from '@angular/core';

import { YoutubePlayerComponent } from "./components/youtube-player/youtube-player.component";
import { RequestBoxComponent } from "./components/request-box/request-box.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(YoutubePlayerComponent) player!: YoutubePlayerComponent;
  @ViewChild(RequestBoxComponent) requestBox!: RequestBoxComponent;

  appName = "jukebox";

  onEnded(event: any): void {
    const videoId = this.requestBox.getShuffle();
    if (videoId) {
      this.player.playVideo(videoId);
    }
  }

  onChangeCurrentTime(event: number): void {
  }

  onSelect(event: any): void {
    this.player.playVideo(event);
  }

  onDeselect(event: any): void {
    this.player.pauseVideo();
  }
}
