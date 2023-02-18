import { Component, OnInit, Output, ViewChild, EventEmitter, Input, OnDestroy, HostListener } from '@angular/core';

import { ProgressBarMode } from '@angular/material/progress-bar';
import { YouTubePlayer } from '@angular/youtube-player';

import { StorageService, Storage } from '../../service/storage.service';
import { Video } from '../request-box/request-box.component';


let apiLoaded: boolean = false;

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.css']
})
export class YoutubePlayerComponent implements OnInit, OnDestroy {
  constructor() { }

  @ViewChild(YouTubePlayer) youtube!: YouTubePlayer;

  @Output() next = new EventEmitter<boolean>();
  @Output() previous = new EventEmitter<boolean>();
  @Output() shuffle = new EventEmitter<void>();

  @Input()
  public set video(video: Video | undefined) {
    window.clearInterval(this.watchCurrentTimeId);
    window.clearInterval(this.watchLoadedFractionTimeId);
    this.youtube?.stopVideo();
    this._video = video;
  }
  public _video: Video | undefined;

  public isPlaying: boolean = false;

  private watchCurrentTimeId: number | undefined;
  private watchLoadedFractionTimeId: number | undefined;
  private isReady: boolean = false;

  width: number | undefined;
  height: number | undefined;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
  suggestedQuality: "default" | "small" | "medium" | "large" | "hd720" | "hd1080" | "highres" | undefined;
  showBeforeIframeApiLoads: boolean | undefined;

  private readonly maxSize: number = 400;

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
    this.youtube.setVolume(this.settings.volume.value);
    if (this.settings.volume.muted) {
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
        this.isPlaying = false;
        this.progressbar.show = false;
        this.progressbar.mode = 'indeterminate';
        event.target.playVideo();
        break;

      case YT.PlayerState.ENDED:
        window.clearInterval(this.watchCurrentTimeId);
        console.debug('Cancel current time watching. id: %d', this.watchCurrentTimeId);

        window.clearInterval(this.watchLoadedFractionTimeId);
        console.debug('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);

        this.isPlaying = false;
        if (this.settings.repeat === Repeat.One) {
          this.youtube.seekTo(0, true);
        } else {
          this.next.emit(this.settings.repeat === Repeat.On);
        }
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

        this.isPlaying = true;
        this.progressbar.show = true;
        this.progressbar.mode = 'buffer';
        break;

      case YT.PlayerState.PAUSED:
        window.clearInterval(this.watchCurrentTimeId);
        console.debug('Cancel current time watching. id: %d', this.watchCurrentTimeId);

        window.clearInterval(this.watchLoadedFractionTimeId);
        console.debug('Cancel loaded fraction watching. id: %d', this.watchLoadedFractionTimeId);

        this.isPlaying = false;
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
    if (this.youtube.getCurrentTime() < 1) {
      this.previous.emit(this.settings.repeat === Repeat.On);
    } else {
      this.youtube.seekTo(0, true);
    }
    event.stopPropagation();
  }

  onClickPlayPause(event: UIEvent): void {
    if (this.isReady) {
      if (this.youtube.getPlayerState() === YT.PlayerState.PLAYING) {
        this.youtube.pauseVideo();
      } else {
        this.youtube.playVideo();
      }
    } else {
      this.next.emit(this.settings.repeat === Repeat.On);
    }
    event.stopPropagation();
  }

  onClickSkipNext(event: UIEvent): void {
    this.next.emit(this.settings.repeat === Repeat.On);
    event.stopPropagation();
  }


  onClickShuffle(event: UIEvent): void {
    this.settings.shuffle = !this.settings.shuffle;
    if (this.settings.shuffle) {
      this.shuffle.emit();
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

  onValueChange(event: number): void {
    this.youtube.setVolume(event);
    this.settings.volume.value = event;
    StorageService.setItem(Storage.Settings, this.settings);
  }

  onClickSlider(event: UIEvent): void {
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
