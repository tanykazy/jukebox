import { Component, ViewChild, ViewChildren, HostListener, QueryList } from '@angular/core';
import { MatSliderDragEvent } from '@angular/material/slider';
import { LegacyProgressBarMode as ProgressBarMode } from '@angular/material/legacy-progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig, MatDialogState } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { YoutubePlayerComponent, PlayerState } from "./components/youtube-player/youtube-player.component";
import { RequestBoxComponent, Request, Size } from "./components/request-box/request-box.component";
import { RequestDialogComponent, DialogData } from "./components/request-dialog/request-dialog.component";
import { StorageService, Storage } from './service/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public appName = "jukebox";

  @ViewChild(RequestBoxComponent) requestBox!: RequestBoxComponent;
  @ViewChildren(YoutubePlayerComponent) players!: QueryList<YoutubePlayerComponent>;
  @ViewChild(YoutubePlayerComponent) player!: YoutubePlayerComponent;

  public settings: Settings = {
    repeat: Repeat.Off,
    shuffle: false,
    volume: {
      value: 50,
      muted: false
    }
  };
  // playlist: Array<number> = new Array();
  public playback: Playback = new Playback('');
  public screenSize!: Size;
  private cols: number = 1;
  public barmode!: ProgressBarMode;
  public bufferValue: number = 0;
  public value: number = 0;
  private maxWidth: number = 400;
  public cutoffTime: number = 0;
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
        this.skipNext(this.settings.repeat !== Repeat.Off, this.settings.repeat === Repeat.Off);
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
          this.skipNext(this.settings.repeat === Repeat.On, this.settings.repeat === Repeat.Off);
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

  onClickRequest(event: Request): void {
    if (this.playback.videoid !== event.videoid) {
      this.playback = new Playback(event.videoid);
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
    // const index = this.requestBox.getIndex(event);
    // const index = this.requests.indexOf(event);
    // if (index !== -1) {
    //   this.playback = new Playback();
    //   this.playback.videoid = event;
    //   this.playback.index = index;
    // }
  }

  onClickListDelete(event: string): void {
    // this.requests = this.requests.filter((request) => request !== event);
    // this.requestBox.removeRequest(event);
  }

  onClickSkipPrevious(event: UIEvent): void {
    const request = this.requestBox.requests.previous(true);
    this.playback = new Playback(request.videoid);
  }

  onClickPlayPause(event: UIEvent): void {
    // this.controlEvent.emit(Control.Play);
    if (this.playback) {
      if (this.playback.isPlaying) {
        this.player.pauseVideo();
      } else {
        this.player.playVideo();
      }
    } else {
      if (this.requestBox.requests.has()) {
        const request = this.requestBox.requests.next(false);
        this.playback = new Playback(request.videoid);
      }
    }
  }

  onClickSkipNext(event: UIEvent): void {
    // this.controlEvent.emit(Control.SkipNext);
    this.skipNext(true, this.settings.repeat === Repeat.Off);
  }

  onClickShuffle(event: UIEvent): void {
    this.settings.shuffle = !this.settings.shuffle;
    if (this.settings.shuffle) {
      // shuffle(this.requests);
      this.requestBox.requests.shuffle();
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

  onInputSlider(event: number): void {
    if (event!== null) {
      this.settings.volume.value = event;
      this.saveSettings(this.settings);
    }
  }

  onClickShare(event: UIEvent): void {
    const url = new URL(window.location.href);
    if (this.requestBox.requests.length > 0) {
      let param = [];
      while (this.requestBox.requests.has()) {
        param.push(this.requestBox.requests.next(false).videoid);
      }
      url.search = `requests=${param.join(',')}`;
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
    this.openDialog();
  }

  @HostListener('document:paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (this.dialogState !== MatDialogState.OPEN) {
      const clipboardData = event.clipboardData;
      if (clipboardData) {
        const paste = clipboardData.getData('text');
        const urls = paste.split(/\r\n|\r|\n|\s/);
        for (const url of urls) {
          try {
            this.requestBox.addRequest(new URL(url));
          } catch (error) {
            console.warn(error);
          }
        }
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
        const urls = result.url.split(/\r\n|\r|\n|\s/);
        for (const url of urls) {
          try {
            this.requestBox.addRequest(new URL(url));
          } catch (error) {
            console.warn(error);
          }
        }
      }
    });
  }

  private openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      announcementMessage: message,
      duration: 5000
    });
  }

  private resizeGrid(screenSize: Size): void {
    let cols: number = Math.floor(screenSize.width / this.maxWidth);
    let size: number = this.maxWidth;
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

  private skipNext(loop: boolean, remove: boolean): void {
    if (remove) {
      this.requestBox.removeRequest({ videoid: this.playback.videoid });
    }
    if (this.requestBox.requests.length === 0) {
      return;
    }
    const request = this.requestBox.requests.next(loop);
    if (request) {
      this.playback = new Playback(request.videoid);
      // this.playback.videoid = request.videoid;
    }
    // this.playback.index = index;
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

class Playback {
  constructor(videoid: string) {
    this.videoid = videoid;
  }
  videoid: string;
  state: PlayerState | undefined;
  time: number = 0;
  duration: number = 0;
  fraction: number = 0;
  index: number = -1;
  isPlaying: boolean = false;
}
