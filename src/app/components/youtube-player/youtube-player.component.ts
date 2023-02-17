import { Component, OnInit, Output, ViewChild, EventEmitter, Input, OnDestroy, HostListener } from '@angular/core';

import { ProgressBarMode } from '@angular/material/progress-bar';
import { MatSliderDragEvent } from '@angular/material/slider';
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

let apiLoaded: boolean = false;

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.css']
})
export class YoutubePlayerComponent implements OnInit, OnDestroy {
  constructor() { }

  private readonly maxSize: number = 400;

  @ViewChild(YouTubePlayer) youtube!: YouTubePlayer;

  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

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
      this.youtube.setVolume(value);
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
        this.youtube.mute();
      } else {
        this.youtube.unMute();
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

  width: number | undefined;
  height: number | undefined;
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
    this.resize(window.innerWidth, window.innerHeight);
  }

  ngOnDestroy(): void {
    window.clearInterval(this.watchCurrentTimeId);
    window.clearInterval(this.watchLoadedFractionTimeId);
  }

  onReady(event: YT.PlayerEvent): void {
    console.info('Video %s ready.', event.target.getVideoUrl());
    this.isReady = true;
    this.youtube.setVolume(this.volume);
    if (this.muted) {
      this.youtube.mute();
    } else {
      this.youtube.unMute();
    }
    event.target.playVideo();
  }

  onStateChange(event: YT.OnStateChangeEvent): void {
    console.debug('Player state changed to %d', event.data);
    switch (event.data) {
      case YT.PlayerState.UNSTARTED:
        this.progressbar.show = false;
        this.progressbar.mode = 'indeterminate';
        event.target.playVideo();
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
        this.progressbar.show = true;
        this.progressbar.mode = 'buffer';
        break;

      default:
        console.warn('Unknown state %d', event.data);
        break;
    }
  }

  onClickSkipPrevious(event: UIEvent): void {
    // const request = this.requestBox.requests.previous(true);
    // this.playback = new Playback(request.videoid);
    event.stopPropagation();
  }

  onClickPlayPause(event: UIEvent): void {
    if (this.isReady) {
      if (this.youtube.getPlayerState() === YT.PlayerState.PLAYING) {
        this.youtube.pauseVideo();
      } else {
        this.youtube.playVideo();
      }
    }
    event.stopPropagation();
  }

  onClickSkipNext(event: UIEvent): void {
    // this.controlEvent.emit(Control.SkipNext);
    // this.skipNext(true, this.settings.repeat === Repeat.Off);
    event.stopPropagation();
  }


  onClickShuffle(event: UIEvent): void {
    this.settings.shuffle = !this.settings.shuffle;
    if (this.settings.shuffle) {
      // shuffle(this.requests);
      // this.requestBox.requests.shuffle();
    }
    StorageService.setItem(Storage.Settings, this.settings);
    event.stopPropagation();
  }

  onClickRepeat(event: UIEvent): void {
    this.settings.repeat = (this.settings.repeat + 1) % 3;
    StorageService.setItem(Storage.Settings, this.settings);
    event.stopPropagation();
  }

  onClickVolume(event: UIEvent): void {
    this.settings.volume.muted = !this.settings.volume.muted;
    if (this.settings.volume.muted) {
      this.youtube.mute();
    } else {
      this.youtube.unMute();
    }
    StorageService.setItem(Storage.Settings, this.settings);
    event.stopPropagation();
  }

  onDragStart(event: MatSliderDragEvent): void {
    console.log(event);
  }

  onDragEnd(event: MatSliderDragEvent): void {
    console.log(event);
  }

  onValueChange(event: number): void {
    console.log(event);
    this.volume = event;
    this.settings.volume.value = event;
    StorageService.setItem(Storage.Settings, this.settings);
  }

  onClickSlider(event: UIEvent): void {
    console.log(event);
    event.stopPropagation();
  }

  private watchCurrentTime(target: YT.Player): void {
    const time: number = target.getCurrentTime();
    this.progressbar.value = time / this.youtube.getDuration() * 100;
  }

  private watchLoadedFraction(target: YT.Player): void {
    const fraction: number = target.getVideoLoadedFraction();
    this.progressbar.bufferValue = fraction * 100;
    if (fraction === 1) {
      window.clearInterval(this.watchLoadedFractionTimeId);
      console.debug('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);
    }
  }

  @HostListener('window:resize', ['$event'])
  private onWindowResize(event: UIEvent): void {
    this.resize(window.innerWidth, window.innerHeight);
  }

  private resize(width: number, height: number): void {
    const size = Math.min(width, height, this.maxSize) * 0.9;
    this.width = size;
    this.height = size;
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
