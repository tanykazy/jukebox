import { Component, OnInit, Output, ViewChild, EventEmitter, Input, OnDestroy } from '@angular/core';

import { YouTubePlayer } from "@angular/youtube-player";

let apiLoaded = false;

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.css']
})
export class YoutubePlayerComponent implements OnInit, OnDestroy {
  @ViewChild(YouTubePlayer) youtube!: YouTubePlayer;

  @Output() changeCurrentTime: EventEmitter<number> = new EventEmitter();
  @Output() changeLoadedFraction: EventEmitter<number> = new EventEmitter();
  @Output() ready: EventEmitter<YoutubePlayerComponent> = new EventEmitter();
  @Output() state: EventEmitter<PlayerState> = new EventEmitter();

  @Input()
  public set videoId(id: string | undefined) {
    window.clearInterval(this.watchCurrentTimeId);
    window.clearInterval(this.watchLoadedFractionTimeId);
    this._videoId = id;
  }
  public get videoId(): string | undefined {
    return this._videoId;
  }
  public _videoId: string | undefined;

  @Input()
  public set volume(value: number) {
    if (this.isReady) {
      this.setVolume(value);
    }
    this._volume = value;
  }
  public get volume(): number {
    return this._volume;
  }
  private _volume: number = 0;

  @Input()
  public set muted(mute: boolean) {
    if (this.isReady) {
      if (mute) {
        this.mute();
      } else {
        this.unMute();
      }
    }
    this._muted = mute;
  }
  public get muted(): boolean {
    return this._muted;
  }
  private _muted: boolean = false;

  @Input() height: number | undefined;
  @Input() width: number | undefined;

  private watchCurrentTimeId: number | undefined;
  private watchLoadedFractionTimeId: number | undefined;
  private isReady: boolean = false;

  startSeconds: number | undefined;
  endSeconds: number | undefined;
  suggestedQuality: "default" | "small" | "medium" | "large" | "hd720" | "hd1080" | "highres" | undefined;
  showBeforeIframeApiLoads: boolean | undefined;

  public get currentTime(): number {
    const time: number = this.youtube.getCurrentTime();
    return time;
  }

  public get loadedFraction(): number {
    const fraction: number = this.youtube.getVideoLoadedFraction();
    return fraction;
  }

  constructor() { }

  ngOnInit(): void {
    if (!apiLoaded) {
      // This code loads the IFrame Player API code asynchronously, according to the instructions at
      // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
      const scriptElement: HTMLScriptElement = document.createElement('script');
      scriptElement.src = 'https://www.youtube.com/iframe_api';
      console.info('Load API %s', scriptElement.src);
      document.body.appendChild(scriptElement);
      apiLoaded = true;
    } else {
      console.debug('API loaded.');
    }
  }

  ngOnDestroy(): void {
    window.clearInterval(this.watchCurrentTimeId);
    window.clearInterval(this.watchLoadedFractionTimeId);
  }

  onReady(event: YT.PlayerEvent): void {
    console.info('Video %s ready.', event.target.getVideoUrl());
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
    console.info('Player state changed to %d', event.data);
    switch (event.data) {
      case PlayerState.UNSTARTED:
        break;

      case PlayerState.ENDED:
        window.clearInterval(this.watchCurrentTimeId);
        // console.info('Cancel current time watching. id: %d', this.watchCurrentTimeId);

        window.clearInterval(this.watchLoadedFractionTimeId);
        // console.info('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);
        break;

      case PlayerState.PLAYING:
        window.clearInterval(this.watchCurrentTimeId);
        // console.info('Cancel current time watching. id: %d', this.watchCurrentTimeId);

        this.watchCurrentTimeId = window.setInterval(() => {
          this.watchCurrentTime(event.target);
        }, 100);
        // console.info('Start watching current time. id: %d', this.watchCurrentTimeId);

        window.clearInterval(this.watchLoadedFractionTimeId);
        // console.info('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);

        this.watchLoadedFractionTimeId = window.setInterval(() => {
          this.watchLoadedFraction(event.target);
        }, 100);
        // console.info('Start watching loaded fraction. id: %d', this.watchLoadedFractionTimeId);
        break;

      case PlayerState.PAUSED:
        window.clearInterval(this.watchCurrentTimeId);
        // console.info('Cancel current time watching. id: %d', this.watchCurrentTimeId);

        window.clearInterval(this.watchLoadedFractionTimeId);
        // console.info('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);
        break;

      case PlayerState.BUFFERING:
        window.clearInterval(this.watchLoadedFractionTimeId);
        // console.info('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);

        this.watchLoadedFractionTimeId = window.setInterval(() => {
          this.watchLoadedFraction(event.target);
        }, 100);
        // console.info('Start watching loaded fraction. id: %d', this.watchLoadedFractionTimeId);
        break;

      case PlayerState.CUED:
        // event.target.playVideo();
        break;

      default:
        console.warn('Unknown state %d', event.data);
        break;
    }
    this.state.emit(event.data);
  }

  private watchCurrentTime(target: YT.Player): void {
    const time: number = target.getCurrentTime();
    this.changeCurrentTime.emit(time);
  }

  private watchLoadedFraction(target: YT.Player): void {
    const fraction: number = target.getVideoLoadedFraction();
    this.changeLoadedFraction.emit(fraction);
    if (fraction === 1) {
      window.clearInterval(this.watchLoadedFractionTimeId);
      // console.info('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);
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
   * stopVideo
   */
  public stopVideo(): void {
    this.youtube.stopVideo();
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
