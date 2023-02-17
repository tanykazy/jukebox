import { Component, ViewChild, HostListener } from '@angular/core';
import { LegacyProgressBarMode as ProgressBarMode } from '@angular/material/legacy-progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { YoutubePlayerComponent } from "./components/youtube-player/youtube-player.component";
import { RequestBoxComponent, Request } from "./components/request-box/request-box.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public appName = "jukebox";

  @ViewChild(RequestBoxComponent) requestBox!: RequestBoxComponent;
  @ViewChild(YoutubePlayerComponent) player!: YoutubePlayerComponent;

  // playlist: Array<number> = new Array();
  public playback: Playback = new Playback('');
  public barmode!: ProgressBarMode;
  public bufferValue: number = 0;
  public value: number = 0;
  public cutoffTime: number = 0;

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
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

  onClickSkipPrevious(event: UIEvent): void {
    const request = this.requestBox.requests.previous(true);
    this.playback = new Playback(request.videoid);
  }

  onClickPlayPause(event: UIEvent): void {
    // this.controlEvent.emit(Control.Play);
    if (this.playback) {
      if (this.playback.isPlaying) {
        // this.player.pauseVideo();
      } else {
        // this.player.playVideo();
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
    // this.skipNext(true, this.settings.repeat === Repeat.Off);
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

  private openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      announcementMessage: message,
      duration: 5000
    });
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
}

class Playback {
  constructor(videoid: string) {
    this.videoid = videoid;
  }
  videoid: string;
  state: YT.PlayerState | undefined;
  time: number = 0;
  duration: number = 0;
  fraction: number = 0;
  index: number = -1;
  isPlaying: boolean = false;
}
