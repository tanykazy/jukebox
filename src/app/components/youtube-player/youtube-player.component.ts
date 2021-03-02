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

  _videoId: string | undefined;
  set videoId(id: string) {
    this._videoId = id;
    this.youtube.playVideo();
    this.fadein();
  }

  height: number | undefined;
  width: number | undefined;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
  baseVolume: number;
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
    this.baseVolume = 100;
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
    this.fadein();
  }

  onStateChange(event: any): void {
    console.log(event);

    if (event.data === 0) {
      this.ended.emit(event.data);
    } else if (event.data === 2) {
      event.target.playVideo();
      this.fadein();
    } else if (event.data === 5) {
      // for auto play when second time loaded
      event.target.playVideo();
      this.fadein();
    }
  }

  /**
   * skip
   */
  public skip() {

  }

  /**
   * fadein
   */
  public fadein() {
    const volume = this.youtube.getVolume();
    if (volume > 0) {
      this.youtube.setVolume(0);
      this.baseVolume = volume;
    }
    const step = Math.floor(this.baseVolume / 10);
    const timerid = setInterval(() => {
      const volume = this.youtube.getVolume();
      if (volume < this.baseVolume) {
        this.youtube.setVolume(volume + step);
      } else {
        clearInterval(timerid);
      }
    }, 200);
  }

  /**
   * fadeout
   */
  public fadeout() {
    this.baseVolume = this.youtube.getVolume();
    const step = Math.floor(this.baseVolume / 10);
    const timerid = setInterval(() => {
      const volume = this.youtube.getVolume();
      if (volume > 0) {
        this.youtube.setVolume(volume - step);
      } else {
        clearInterval(timerid);
        this.youtube.pauseVideo();
      }
    }, 200);
  }

  /**
   * getState
   */
  public getState() {
    console.log(this.youtube.getPlayerState());
    return this.youtube.getPlayerState();
  }

}
