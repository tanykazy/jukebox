import { Component, ViewChild, ViewChildren, HostListener, QueryList } from '@angular/core';

import { YoutubePlayerComponent } from "./components/youtube-player/youtube-player.component";
import { RequestBoxComponent } from "./components/request-box/request-box.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(RequestBoxComponent) requestBox!: RequestBoxComponent;
  @ViewChildren(YoutubePlayerComponent) players!: QueryList<YoutubePlayerComponent>;

  appName = "jukebox";
  requests!: Set<string>;
  screenWidth: number = 0;
  screenHeight: number = 0;

  ngOnInit() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  onEnded(videoId: string): void {
    console.log(videoId);
    console.log(this.players);
    const players = this.players.toArray();
    const index = players.findIndex((player) => player.videoId === videoId);
    const player = this.players.get(index + 1);
    if (player) {
      player.playVideo();
    }
  }

  onChangeCurrentTime(event: number): void {
  }

  onSelect(event: any): void {
    const players = this.players.toArray();
    const index = players.findIndex((player) => player.videoId === event);
    const player = this.players.get(index);
    if (player) {
      player.playVideo();
    }
  }

  onDeselect(event: any): void {
    const players = this.players.toArray();
    const index = players.findIndex((player) => player.videoId === event);
    const player = this.players.get(index);
    if (player) {
      player.pauseVideo();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: UIEvent) {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }
}
