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
  requests: Array<string> = new Array();
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
    this.requests = this.requests.filter((request) => request !== event.videoId);
    const request = this.requestBox.getShuffle();
    const players = this.players.filter((player) => player.videoId === request);
    if (players.length > 0) {
      players[0].playVideo();
    }
  }

  onChangeCurrentTime(event: YoutubePlayerComponent): void {
  }

  onReady(event: YoutubePlayerComponent): void {
  }

  onSelect(event: string): void {
    const players = this.players.filter((player) => player.videoId === event);
    if (players.length > 0) {
      players[0].playVideo();
    }
  }

  onDeselect(event: string): void {
    const players = this.players.filter((player) => player.videoId === event);
    if (players.length > 0) {
      players[0].pauseVideo();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: UIEvent): void {
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
