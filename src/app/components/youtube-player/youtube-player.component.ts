import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';

import { YouTubePlayer } from "@angular/youtube-player";

let apiLoaded = false;

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.css']
})
export class YoutubePlayerComponent implements OnInit {
  @ViewChild(YouTubePlayer) youtube!: YouTubePlayer;

  @Input() videoId: string | undefined;
  @Input() height: number | undefined;
  @Input() width: number | undefined;

  @Output() ended: EventEmitter<YoutubePlayerComponent> = new EventEmitter();
  @Output() changeCurrentTime: EventEmitter<YoutubePlayerComponent> = new EventEmitter();
  @Output() ready: EventEmitter<YoutubePlayerComponent> = new EventEmitter();

  private watchCurrentTimeId: any | undefined;

  startSeconds: number | undefined;
  endSeconds: number | undefined;
  suggestedQuality: "default" | "small" | "medium" | "large" | "hd720" | "hd1080" | "highres" | undefined;
  showBeforeIframeApiLoads: boolean | undefined;

  constructor() { }

  ngOnInit(): void {
    if (!apiLoaded) {
      // This code loads the IFrame Player API code asynchronously, according to the instructions at
      // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      apiLoaded = true;
    }
  }

  onReady(event: YT.PlayerEvent): void {
    this.ready.emit(this);
  }

  onStateChange(event: YT.OnStateChangeEvent): void {
    if (event.data === 0) {
      clearInterval(this.watchCurrentTimeId);
      this.ended.emit(this);
    } else if (event.data === 1) {
      this.watchCurrentTimeId = setInterval(() => {
        this.watchCurrentTime(event.target);
      }, 1000);
    } else if (event.data === 2) {
      clearInterval(this.watchCurrentTimeId);
    } else if (event.data === 5) {
      // event.target.playVideo();
    }
  }

  private watchCurrentTime(target: YT.Player): void {
    const time = target.getCurrentTime();
    this.changeCurrentTime.emit(this);
  }

  /**
   * playVideo
   */
  public playVideo(): void {
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

  /**
   * getVideoUrl
   */
  public getVideoUrl(): string {
    return this.youtube.getVideoUrl();
  }
}
