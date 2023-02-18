import { Component, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { YoutubePlayerComponent } from "./components/youtube-player/youtube-player.component";
import { RequestBoxComponent, Video } from "./components/request-box/request-box.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar) { }

  public appName = "jukebox";
  public video!: Video;

  @ViewChild(RequestBoxComponent) requestBox!: RequestBoxComponent;
  @ViewChild(YoutubePlayerComponent) player!: YoutubePlayerComponent;

  onClickVideo(event: Video): void {
    this.video = event;
  }

  onSelect(event: string): void {
  }

  onDeselect(event: string): void {
  }

  onPrevious(loop: boolean): void {
    const video = this.requestBox.previous(loop);
    this.video = video;
  }

  onNext(loop: boolean): void {
    const video = this.requestBox.next(loop);
    this.video = video;
  }

  onShuffle(): void {
    this.requestBox.shuffle();
  }

  onClickShare(event: UIEvent): void {
    const url = new URL(window.location.href);
    if (this.requestBox.length > 0) {
      let param = [];
      while (this.requestBox.has()) {
        param.push(this.requestBox.next(false).videoid);
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
}
