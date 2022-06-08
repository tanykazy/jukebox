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
  volume: number = 50;
  muted: boolean = false;
  screenWidth: number = 0;
  screenHeight: number = 0;
  cols: number = 1;
  minWidth: number = 400;

  ngOnInit() {
    this.resizeGrid(window.innerWidth, window.innerHeight);
  }

  onEnded(event: YoutubePlayerComponent): void {
    const players = this.players.toArray();
    const index = players.findIndex((player) => player.videoId === event.videoId);
    const player = this.players.get(index + 1);
    if (player) {
      player.playVideo();
    }
  }

  onChangeCurrentTime(event: YoutubePlayerComponent): void {
  }

  onReady(event: YoutubePlayerComponent): void {
  }

  onSelect(event: string): void {
    const players = this.players.toArray();
    const index = players.findIndex((player) => player.videoId === event);
    const player = this.players.get(index);
    if (player) {
      player.playVideo();
    }
  }

  onDeselect(event: string): void {
    const players = this.players.toArray();
    const index = players.findIndex((player) => player.videoId === event);
    const player = this.players.get(index);
    if (player) {
      player.pauseVideo();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: UIEvent) {
    this.resizeGrid(window.innerWidth, window.innerHeight);
  }

  private resizeGrid(windowWidth: number, windowHeight: number): void {
    let cols = Math.floor(windowWidth / this.minWidth);
    let size = this.minWidth;
    if (cols > 0) {
      size = Math.floor(window.innerWidth / cols);
    } else {
      size = window.innerWidth;
      cols = cols + 1;
    }
    this.screenWidth = size;
    this.screenHeight = size;
    this.cols = cols;
  }
}
