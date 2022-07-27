import { Component, ViewChild, ViewChildren, HostListener, QueryList } from '@angular/core';
import { MatSliderChange } from "@angular/material/slider";
import { YoutubePlayerComponent } from "./components/youtube-player/youtube-player.component";
import { RequestBoxComponent } from "./components/request-box/request-box.component";
import { StorageService, Storage } from './service/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(RequestBoxComponent) requestBox!: RequestBoxComponent;
  @ViewChildren(YoutubePlayerComponent) players!: QueryList<YoutubePlayerComponent>;

  appName = "jukebox";
  requests: Array<string> = new Array();
  settings: Settings = new Settings();
  screenWidth: number = 0;
  screenHeight: number = 0;
  cols: number = 1;
  minWidth: number = 400;

  ngOnInit() {
    this.resizeGrid(window.innerWidth, window.innerHeight);
    const settings: Settings = StorageService.getItem(Storage.Settings);
    if (settings) {
      this.settings = settings;
    }
  }

  onControlEvent(event: Control) {
    // console.log(event);
  }

  onEnded(event: YoutubePlayerComponent): void {
    this.requests = this.requests.filter((request) => request !== event.videoId);
    const request = this.requestBox.getShuffle();
    const players = this.players.filter((player) => player.videoId === request);
    if (players.length > 0) {
      players[0].playVideo();
    }
  }

  onChangeCurrentTime(event: YoutubePlayerComponent): void {
  }

  onReady(event: YoutubePlayerComponent): void {
  }

  onSelect(event: string): void {
    const players = this.players.filter((player) => player.videoId === event);
    if (players.length > 0) {
      players[0].playVideo();
    }
  }

  onDeselect(event: string): void {
    const players = this.players.filter((player) => player.videoId === event);
    if (players.length > 0) {
      players[0].pauseVideo();
    }
  }

  onClickSkipPrevious(event: UIEvent): void {
    // this.controlEvent.emit(Control.SkipPrevious);
  }

  onClickStop(event: UIEvent): void {
    // this.controlEvent.emit(Control.Stop);
  }

  onClickPlay(event: UIEvent): void {
    // this.controlEvent.emit(Control.Play);
  }

  onClickPause(event: UIEvent): void {
    // this.controlEvent.emit(Control.Pause);
  }

  onClickSkipNext(event: UIEvent): void {
    // this.controlEvent.emit(Control.SkipNext);
  }

  onClickShuffle(event: UIEvent): void {
    this.settings.shuffle = !this.settings.shuffle;
    this.saveSettings(this.settings);
  }

  onClickRepeat(event: UIEvent): void {
    this.settings.repeat = (this.settings.repeat + 1) % 3;
    this.saveSettings(this.settings);
  }

  onClickVolume(event: UIEvent): void {
    this.settings.volume.muted = !this.settings.volume.muted;
    this.saveSettings(this.settings);
  }

  onInputSlider(event: MatSliderChange): void {
    if (event.value !== null) {
      this.settings.volume.value = event.value;
      this.saveSettings(this.settings);
    }
  }

  @HostListener('document:paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData;
    if (clipboardData) {
      const paste = clipboardData.getData('text');
      this.requestBox.addRequest(paste);
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: UIEvent): void {
    this.resizeGrid(window.innerWidth, window.innerHeight);
  }

  private resizeGrid(windowWidth: number, windowHeight: number): void {
    let cols = Math.floor(windowWidth / this.minWidth);
    let size = this.minWidth;
    if (cols > 0) {
      size = Math.floor(window.innerWidth / cols);
    } else {
      size = window.innerWidth;
      cols = cols + 1;
    }
    this.screenWidth = size;
    this.screenHeight = size;
    this.cols = cols;
  }

  private saveSettings(settings: Settings): void {
    StorageService.setItem(Storage.Settings, settings);
  }
}

const Control = {
  SkipPrevious: 'SKIPPREVIOUS',
  Stop: 'STOP',
  Play: 'PLAY',
  Pause: 'PAUSE',
  SkipNext: 'SKIPNEXT',
} as const;
export type Control = typeof Control[keyof typeof Control];

export class Settings {
  public volume: Volume;
  public repeat: number = 0;
  public shuffle: boolean = false;

  constructor() {
    this.volume = new Volume();
  }
}

class Volume {
  public value: number = 50;
  public muted: boolean = false;
}
