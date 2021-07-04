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
  @Output() changeCurrentTime = new EventEmitter();

  private watchCurrentTimeId: any;

  videoId: string | undefined;
  height: number | undefined;
  width: number | undefined;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
  suggestedQuality: "default" | "small" | "medium" | "large" | "hd720" | "hd1080" | "highres" | undefined;
  showBeforeIframeApiLoads: boolean | undefined;

  constructor() { }

  ngOnInit(): void {
    // This code loads the IFrame Player API code asynchronously, according to the instructions at
    // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }

  onReady(event: any): void {
    event.target.autoplay = 1;
    // for auto play when first time loaded
    event.target.playVideo();
  }

  onStateChange(event: any): void {
    if (event.data === 0) {
      clearInterval(this.watchCurrentTimeId);
      this.ended.emit(event.data);
    } else if (event.data === 1) {
      this.watchCurrentTimeId = setInterval(() => {
        this.watchCurrentTime();
      }, 1000);
    } else if (event.data === 2) {
      clearInterval(this.watchCurrentTimeId);
    } else if (event.data === 5) {
      event.target.playVideo();
    }
  }

  private watchCurrentTime(): void {
    const time = this.youtube.getCurrentTime();
    this.changeCurrentTime.emit(time);
  }

  /**
   * playVideo
   */
  public playVideo(videoId: string): void {
    this.videoId = videoId;
    this.youtube.playVideo();
  }

  /**
   * pauseVideo
   */
  public pauseVideo(): void {
    this.youtube.pauseVideo();
  }

  /**
   * getDuration
   */
  public getDuration(): number {
    return this.youtube.getDuration();
  }

}
