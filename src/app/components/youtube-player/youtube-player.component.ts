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

  @Input()
  set volume(value: number) {
    if (this.isReady) {
      this.setVolume(value);
    }
  }

  @Input()
  set muted(mute: boolean) {
    if (this.isReady) {
      if (mute) {
        this.mute();
      } else {
        this.unMute();
      }
    }
  }

  private watchCurrentTimeId: any | undefined;
  private isReady: boolean = false;

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
    this.isReady = true;
    this.ready.emit(this);
  }

  onStateChange(event: YT.OnStateChangeEvent): void {
    // console.log(`State Change ${event.data}`);

    switch (event.data) {
      case PlayerState.UNSTARTED:
        break;

      case PlayerState.ENDED:
        clearInterval(this.watchCurrentTimeId);
        this.ended.emit(this);
        break;

      case PlayerState.PLAYING:
        this.watchCurrentTimeId = setInterval(() => {
          this.watchCurrentTime(event.target);
        }, 1000);
        break;

      case PlayerState.PAUSED:
        clearInterval(this.watchCurrentTimeId);
        break;

      case PlayerState.BUFFERING:
        break;

      case PlayerState.CUED:
        // event.target.playVideo();
        break;

      default:
        break;
    }
  }

  private watchCurrentTime(target: YT.Player): void {
    const time = target.getCurrentTime();
    this.changeCurrentTime.emit(this);
  }

  /**
   * setVolume
   */
  public setVolume(volume: number): void {
    this.youtube.setVolume(volume);
  }

  /**
   * getVolume
   */
  public getVolume(): number {
    return this.youtube.getVolume();
  }

  /**
   * mute
   */
  public mute(): void {
    this.youtube.mute();
  }

  /**
   * unMute
   */
  public unMute() {
    this.youtube.unMute();
  }

  /**
   * isMuted
   */
  public isMuted(): boolean {
    return this.youtube.isMuted();
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

const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
} as const;
