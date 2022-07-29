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

  @Output() changeCurrentTime: EventEmitter<number> = new EventEmitter();
  @Output() changeLoadedFraction: EventEmitter<number> = new EventEmitter();
  @Output() ready: EventEmitter<YoutubePlayerComponent> = new EventEmitter();
  @Output() state: EventEmitter<PlayerState> = new EventEmitter();

  @Input()
  set volume(value: number) {
    if (this.isReady) {
      this.setVolume(value);
    }
    this._volume = value;
  }
  get volume(): number {
    return this._volume;
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
    this._muted = mute;
  }
  get muted(): boolean {
    return this._muted;
  }

  private watchCurrentTimeId: any | undefined;
  private watchLoadedFractionTimeId: any | undefined;
  private isReady: boolean = false;
  private _volume: number = 0;
  private _muted: boolean = false;

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
    this.setVolume(this._volume);
    if (this._muted) {
      this.mute();
    } else {
      this.unMute();
    }
  }

  onStateChange(event: YT.OnStateChangeEvent): void {
    this.state.emit(event.data);
    switch (event.data) {
      case PlayerState.UNSTARTED:
        break;

      case PlayerState.ENDED:
        clearInterval(this.watchCurrentTimeId);
        clearInterval(this.watchLoadedFractionTimeId);
        break;

      case PlayerState.PLAYING:
        this.watchCurrentTime(event.target);
        this.watchCurrentTimeId = setInterval(() => {
          this.watchCurrentTime(event.target);
        }, 1000);
        this.watchLoadedFraction(event.target);
        clearInterval(this.watchLoadedFractionTimeId);
        this.watchLoadedFractionTimeId = setInterval(() => {
          this.watchLoadedFraction(event.target);
        }, 1000);
        break;

      case PlayerState.PAUSED:
        clearInterval(this.watchCurrentTimeId);
        clearInterval(this.watchLoadedFractionTimeId);
        break;

      case PlayerState.BUFFERING:
        this.watchLoadedFractionTimeId = setInterval(() => {
          this.watchLoadedFraction(event.target);
        }, 1000);
        break;

      case PlayerState.CUED:
        event.target.playVideo();
        break;

      default:
        break;
    }
  }

  private watchCurrentTime(target: YT.Player): void {
    const time = target.getCurrentTime();
    this.changeCurrentTime.emit(time);
  }

  private watchLoadedFraction(target: YT.Player): void {
    const fraction = target.getVideoLoadedFraction();
    this.changeLoadedFraction.emit(fraction);
    if (fraction === 1) {
      clearInterval(this.watchLoadedFractionTimeId);
    }
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
   * seekTo
   */
  public seekTo(seconds: number, allowSeekAhead: boolean): void {
    this.youtube.seekTo(seconds, allowSeekAhead);
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

export const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
} as const;
export type PlayerState = typeof PlayerState[keyof typeof PlayerState];
