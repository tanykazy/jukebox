import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';

import { YouTubePlayer } from "@angular/youtube-player";

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.css']
})
export class YoutubePlayerComponent implements OnInit {
  @ViewChild(YouTubePlayer) youtube!: YouTubePlayer;

  @Output() ended = new EventEmitter();

  videoId: string | undefined;
  height: number | undefined;
  width: number | undefined;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
  // suggestedQuality: "default" | "small" | "medium" | "large" | "hd720" | "hd1080" | "highres" | undefined;
  // showBeforeIframeApiLoads: boolean | undefined;

  constructor() {
    // this.videoId = "QRiVD82GBk8";
    // this.height = 250;
    // this.width = 500;
    // this.startSeconds = 4;
    // this.endSeconds = 8;
    // this.suggestedQuality = "highres";
    // this.showBeforeIframeApiLoads = true;
  }

  ngOnInit(): void {
    // This code loads the IFrame Player API code asynchronously, according to the instructions at
    // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }

  onReady(event: any): void {
    console.log(event);

    // for auto play when first time loaded
    event.target.playVideo();
  }

  onStateChange(event: any): void {
    console.log(event);

    // for auto play when second time loaded
    if (event.data === 5) {
      event.target.playVideo();
    }

    if (event.data === 0) {
      this.ended.emit(event.data);
    }

  }

  /**
   * getState
   */
  public getState() {
    console.log(this.youtube.getPlayerState());
    return this.youtube.getPlayerState();
  }

}
