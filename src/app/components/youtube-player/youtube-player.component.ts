import { Component, OnInit, Output, ViewChild, EventEmitter, Input, OnDestroy } from '@angular/core';

import { ProgressBarMode } from '@angular/material/progress-bar';
import { MatSliderChange } from '@angular/material/slider';
import { YouTubePlayer } from '@angular/youtube-player';

import { StorageService, Storage } from '../../service/storage.service';

// export type PlayerState = YT.PlayerState;
// export const PlayerState = {
//   UNSTARTED: -1,
//   ENDED: 0,
//   PLAYING: 1,
//   PAUSED: 2,
//   BUFFERING: 3,
//   CUED: 5
// } as const;
// export type PlayerState = typeof PlayerState[keyof typeof PlayerState];
// export type PlayerState = typeof YT.PlayerState[keyof typeof YT.PlayerState];

let apiLoaded = false;

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.css']
})
export class YoutubePlayerComponent implements OnInit, OnDestroy {
  constructor() { }

  @ViewChild(YouTubePlayer) youtube!: YouTubePlayer;

  // @Output() changeCurrentTime = new EventEmitter<number>();
  // @Output() changeLoadedFraction = new EventEmitter<number>();
  // @Output() ready = new EventEmitter<YoutubePlayerComponent>();
  // @Output() state = new EventEmitter<YT.PlayerState>();
  @Output() end = new EventEmitter<void>();

  @Input() height: number | undefined;
  @Input() width: number | undefined;

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
  private _volume: number = 50;

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

  public get playerState(): YT.PlayerState | undefined {
    if (this.isReady) {
      const state = this.youtube.getPlayerState();
      return state;
    }
    return;
  }

  public get isPlaying(): boolean {
    if (this.playerState !== undefined) {
      return this.playerState === YT.PlayerState.PLAYING;
    }
    return false
  }

  settings: Settings = {
    repeat: Repeat.Off,
    shuffle: false,
    volume: {
      value: 50,
      muted: false
    }
  };

  progressbar: ProgressBarSetting = {
    show: false,
    mode: 'determinate',
    bufferValue: NaN,
    value: NaN
  };

  ngOnInit(): void {
    const settings: Settings = StorageService.getItem(Storage.Settings);
    if (settings) {
      this.settings = settings;
    }
    if (!apiLoaded) {
      // This code loads the IFrame Player API code asynchronously, according to the instructions at
      // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
      const scriptElement: HTMLScriptElement = document.createElement('script');
      scriptElement.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(scriptElement);
      apiLoaded = true;
      console.info('Load API %s', scriptElement.src);
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
    // this.ready.emit(this);
    this.setVolume(this.volume);
    if (this.muted) {
      this.mute();
    } else {
      this.unMute();
    }
    event.target.playVideo();
  }

  onStateChange(event: YT.OnStateChangeEvent): void {
    console.debug('Player state changed to %d', event.data);
    switch (event.data) {
      case YT.PlayerState.UNSTARTED:
        this.progressbar.show = false;
        this.progressbar.mode = 'indeterminate';
        break;

      case YT.PlayerState.ENDED:
        window.clearInterval(this.watchCurrentTimeId);
        console.debug('Cancel current time watching. id: %d', this.watchCurrentTimeId);

        window.clearInterval(this.watchLoadedFractionTimeId);
        console.debug('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);
        break;

      case YT.PlayerState.PLAYING:
        window.clearInterval(this.watchCurrentTimeId);
        console.debug('Cancel current time watching. id: %d', this.watchCurrentTimeId);

        this.watchCurrentTimeId = window.setInterval(() => {
          this.watchCurrentTime(event.target);
        }, 100);
        console.debug('Start watching current time. id: %d', this.watchCurrentTimeId);

        window.clearInterval(this.watchLoadedFractionTimeId);
        console.debug('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);

        this.watchLoadedFractionTimeId = window.setInterval(() => {
          this.watchLoadedFraction(event.target);
        }, 100);
        console.debug('Start watching loaded fraction. id: %d', this.watchLoadedFractionTimeId);
        this.progressbar.show = true;
        this.progressbar.mode = 'buffer';
        break;

      case YT.PlayerState.PAUSED:
        window.clearInterval(this.watchCurrentTimeId);
        console.debug('Cancel current time watching. id: %d', this.watchCurrentTimeId);

        window.clearInterval(this.watchLoadedFractionTimeId);
        console.debug('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);
        break;

      case YT.PlayerState.BUFFERING:
        window.clearInterval(this.watchLoadedFractionTimeId);
        console.debug('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);

        this.watchLoadedFractionTimeId = window.setInterval(() => {
          this.watchLoadedFraction(event.target);
        }, 100);
        console.debug('Start watching loaded fraction. id: %d', this.watchLoadedFractionTimeId);
        this.progressbar.show = true;
        this.progressbar.mode = 'buffer';
        break;

      case YT.PlayerState.CUED:
        // event.target.playVideo();
        this.progressbar.show = true;
        this.progressbar.mode = 'buffer';
        break;

      default:
        console.warn('Unknown state %d', event.data);
        break;
    }
    // this.state.emit(event.data);
  }

  onClickSkipPrevious(event: UIEvent): void {
    // const request = this.requestBox.requests.previous(true);
    // this.playback = new Playback(request.videoid);
  }

  onClickPlayPause(event: UIEvent): void {
    if (this.isReady) {
      if (this.youtube.getPlayerState() === YT.PlayerState.PLAYING) {
        this.pauseVideo();
      } else {
        this.playVideo();
      }
    }
  }

  onClickSkipNext(event: UIEvent): void {
    // this.controlEvent.emit(Control.SkipNext);
    // this.skipNext(true, this.settings.repeat === Repeat.Off);
  }


  onClickShuffle(event: UIEvent): void {
    this.settings.shuffle = !this.settings.shuffle;
    if (this.settings.shuffle) {
      // shuffle(this.requests);
      // this.requestBox.requests.shuffle();
    }
    StorageService.setItem(Storage.Settings, this.settings);
  }

  onClickRepeat(event: UIEvent): void {
    this.settings.repeat = (this.settings.repeat + 1) % 3;
    StorageService.setItem(Storage.Settings, this.settings);
  }

  onClickVolume(event: UIEvent): void {
    this.settings.volume.muted = !this.settings.volume.muted;
    if (this.settings.volume.muted) {
      this.mute();
    } else {
      this.unMute();
    }
    StorageService.setItem(Storage.Settings, this.settings);
  }

  onDragStart(event: any): void {
    console.log(event);
  }

  onDragEnd(event: any): void {
    console.log(event);
  }

  onInputSlider(event: MatSliderChange): void {
    if (event.value !== null) {
      this.volume = event.value;
      this.settings.volume.value = event.value;
      StorageService.setItem(Storage.Settings, this.settings);
    }
  }

  private watchCurrentTime(target: YT.Player): void {
    const time: number = target.getCurrentTime();
    this.progressbar.value = time / this.getDuration() * 100;
    // this.changeCurrentTime.emit(time);
  }

  private watchLoadedFraction(target: YT.Player): void {
    const fraction: number = target.getVideoLoadedFraction();
    this.progressbar.bufferValue = fraction * 100;
    // this.changeLoadedFraction.emit(fraction);
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

enum Repeat {
  Off = 0,
  One = 1,
  On = 2,
}

interface Settings {
  volume: Volume;
  repeat: Repeat;
  shuffle: boolean;
}

interface Volume {
  value: number;
  muted: boolean;
}

interface ProgressBarSetting {
  show: boolean,
  mode: ProgressBarMode,
  bufferValue: number,
  value: number
}