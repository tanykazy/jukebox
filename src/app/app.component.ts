import { Component, ViewChild, ViewChildren, HostListener, QueryList } from '@angular/core';
import { MatSliderChange } from "@angular/material/slider";
import { ProgressBarMode } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig, MatDialogState } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { YoutubePlayerComponent, PlayerState } from "./components/youtube-player/youtube-player.component";
import { RequestBoxComponent } from "./components/request-box/request-box.component";
import { RequestDialogComponent, DialogData } from "./components/request-dialog/request-dialog.component";
import { StorageService, Storage } from './service/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(RequestBoxComponent) requestBox!: RequestBoxComponent;
  @ViewChildren(YoutubePlayerComponent) players!: QueryList<YoutubePlayerComponent>;
  @ViewChild(YoutubePlayerComponent) player!: YoutubePlayerComponent;

  appName = "jukebox";
  requests: Array<string> = new Array();
  // settings: Settings = new Settings();
  settings: Settings = {
    repeat: Repeat.Off,
    shuffle: false,
    volume: {
      value: 50,
      muted: false
    }
  };
  playlist: Array<number> = new Array();
  playback: Playback = new Playback();
  screenSize!: ScreenSize;
  cols: number = 1;
  barmode!: ProgressBarMode;
  bufferValue: number = 0;
  value: number = 0;
  maxWidth: number = 400;
  cutoffTime: number = 0;
  private dialogState: MatDialogState = MatDialogState.CLOSED;

  constructor(
    public dialog: MatDialog,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.screenSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.resizeGrid(this.screenSize);
    const params = new URLSearchParams(window.location.search);
    const requests = params.get('requests');
    if (requests) {
      this.requests = requests.split(',');
    }
    const settings: Settings = StorageService.getItem(Storage.Settings);
    if (settings) {
      this.settings = settings;
    }
  }

  onControlEvent(event: Control) {
    // console.log(event);
  }

  onChangeCurrentTime(event: number): void {
    this.playback.time = event;
    this.value = event / this.playback.duration * 100;

    if (this.cutoffTime > 0) {
      if (this.playback.time > this.cutoffTime * 60) {
        this.skipNext(this.settings.repeat !== Repeat.Off);
      }
    }
  }

  onChangeLoadedFraction(event: number): void {
    this.playback.fraction = event;
    this.bufferValue = event * 100;
  }

  onReady(event: YoutubePlayerComponent): void {
    console.info('Player ready.');
    event.playVideo();
  }

  onStateChange(event: PlayerState): void {
    this.playback.state = event;
    switch (event) {
      case PlayerState.UNSTARTED:
        this.barmode = 'indeterminate';
        break;

      case PlayerState.ENDED:
        this.playback.isPlaying = false;
        if (this.settings.repeat === Repeat.One) {
          console.info('Repeat One');
          this.player.seekTo(0, true);
        } else {
          console.info('Skip');
          this.skipNext(this.settings.repeat === Repeat.On);
        }
        break;

      case PlayerState.PLAYING:
        this.playback.isPlaying = true;
        this.playback.duration = this.player.getDuration();
        this.barmode = 'buffer';
        break;

      case PlayerState.PAUSED:
        this.playback.isPlaying = false;
        break;

      case PlayerState.BUFFERING:
        this.barmode = 'buffer';
        break;

      case PlayerState.CUED:
        this.barmode = 'buffer';
        this.player.playVideo();
        break;

      default:
        break;
    }
  }

  onSelect(event: string): void {
    // const players = this.players.filter((player) => player.videoId === event);
    // if (players.length > 0) {
    //   players[0].playVideo();
    // }
  }

  onDeselect(event: string): void {
    // const players = this.players.filter((player) => player.videoId === event);
    // if (players.length > 0) {
    //   players[0].pauseVideo();
    // }
  }

  onClickListPlay(event: string): void {
    const index = this.requests.indexOf(event);
    if (index !== -1) {
      this.playback = new Playback();
      this.playback.videoid = event;
      this.playback.index = index;
    }
  }

  onClickListDelete(event: string): void {
    this.requests = this.requests.filter((request) => request !== event);
  }

  onClickSkipPrevious(event: UIEvent): void {
    // this.controlEvent.emit(Control.SkipPrevious);
    if (this.requests.length > 0) {
      let index = this.playback.index - 1;
      if (index < 0) {
        index = this.requests.length - 1;
      }
      const request = this.requests[index];
      this.playback = new Playback();
      this.playback.videoid = request;
      this.playback.index = index;
    }
  }

  onClickPlayPause(event: UIEvent): void {
    // this.controlEvent.emit(Control.Play);
    if (this.playback.index < 0) {
      const index = 0;
      this.playback = new Playback();
      this.playback.videoid = this.requests[index];
      this.playback.index = index;
    } else {
      if (this.playback.isPlaying) {
        this.player.pauseVideo();
      } else {
        this.player.playVideo();
      }
    }
  }

  onClickSkipNext(event: UIEvent): void {
    // this.controlEvent.emit(Control.SkipNext);
    this.skipNext(true);
  }

  onClickShuffle(event: UIEvent): void {
    this.settings.shuffle = !this.settings.shuffle;
    if (this.settings.shuffle) {
      shuffle(this.requests);
    }
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

  onClickShare(event: UIEvent): void {
    const url = new URL(window.location.href);
    if (this.requests.length > 0) {
      url.search = `requests=${this.requests.join(',')}`;
    }
    const result = this.clipboard.copy(url.href);
    if (result) {
      this.openSnackBar('Copy succeeded.', 'OK');
    } else {
      this.openSnackBar('Failed to copy.', 'OK');
    }
  }

  /**
   * onClickAddButton
   */
  public onClickAddButton(event: UIEvent): void {
    // console.log(event);
    this.openDialog();
  }

  @HostListener('document:paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (this.dialogState !== MatDialogState.OPEN) {
      const clipboardData = event.clipboardData;
      if (clipboardData) {
        const paste = clipboardData.getData('text');
        this.requestBox.addRequest(paste);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: UIEvent): void {
    this.resizeGrid({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  private openDialog(): void {
    const data: DialogData = {
      url: ''
    };
    const config: MatDialogConfig = {
      data: data,
      minWidth: '90%',
    };
    const dialogRef = this.dialog.open(RequestDialogComponent, config);
    dialogRef.afterOpened().subscribe(() => {
      console.debug('Request dialog was opened');
      this.dialogState = MatDialogState.OPEN;
    });
    dialogRef.afterClosed().subscribe((result: DialogData | undefined) => {
      console.debug('Request dialog was closed');
      this.dialogState = MatDialogState.CLOSED;
      if (result) {
        this.requestBox.addRequest(result.url);
      }
    });
  }

  private openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      announcementMessage: message,
      duration: 5000
    });
  }

  private resizeGrid(screenSize: ScreenSize): void {
    let cols = Math.floor(screenSize.width / this.maxWidth);
    let size = this.maxWidth;
    if (cols > 0) {
      size = Math.floor(screenSize.width / cols);
    } else {
      size = screenSize.width;
      cols = cols + 1;
    }
    this.screenSize = {
      width: size,
      height: size
    };
    this.cols = cols;
  }

  private skipNext(loop: boolean): void {
    if (this.requests.length === 0) {
      return;
    }
    let index;
    // if (this.settings.shuffle) {
    // index = Math.floor(Math.random() * this.requests.length);
    // } else {
    index = this.playback.index + 1;
    if (!(index < this.requests.length)) {
      if (!loop) {
        return;
      } else {
        index = index % this.requests.length;
      }
    }
    // }
    const request = this.requests[index];
    this.playback = new Playback();
    this.playback.videoid = request;
    this.playback.index = index;
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

// const Repeat = {
//   Off: 0,
//   One: 1,
//   On: 2,
// } as const;
// type Repeat = typeof Repeat[keyof typeof Repeat];

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

// class Settings {
//   public volume: Volume;
//   public repeat: number = 0;
//   // public shuffle: boolean = false;
//   public shuffle: Shuffle = Shuffle.Off;

//   constructor() {
//     this.volume = new Volume();
//   }
// }

interface Volume {
  value: number;
  muted: boolean;
}

// class Volume {
//   public value: number = 50;
//   public muted: boolean = false;
// }

class Playback {
  videoid: string | undefined;
  state: PlayerState | undefined;
  time: number = 0;
  duration: number = 0;
  fraction: number = 0;
  index: number = -1;
  isPlaying: boolean = false;
}

interface ScreenSize {
  width: number;
  height: number;
}

function shuffle(array: Array<any>): Array<any> {
  let m = array.length;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    const i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    [array[m], array[i]] = [array[i], array[m]];
  }
  return array;
}
