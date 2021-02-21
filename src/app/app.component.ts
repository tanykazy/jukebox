import { Component, ViewChild } from '@angular/core';

import { YoutubePlayerComponent } from "./components/youtube-player/youtube-player.component";
import { PlaylistComponent } from "./components/playlist/playlist.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(YoutubePlayerComponent) player!: YoutubePlayerComponent;
  @ViewChild(PlaylistComponent) playlist!: PlaylistComponent;

  onSubmit(event: any): void {
    this.playlist.addList(event);
  }

  onEnded(event: any): void {
    const videoId = this.playlist.getShuffle();
    if (videoId) {
      this.player.videoId = videoId;
    }
  }

  onSelect(event: any): void {
    this.player.videoId = event;
  }
}
