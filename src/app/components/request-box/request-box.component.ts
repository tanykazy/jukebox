import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';

import { MatDialog, MatDialogConfig, MatDialogState } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { RequestDialogComponent, DialogData } from "../request-dialog/request-dialog.component";
import { YoutubeUrlService, OEmbedResponseTypeVideo } from "../../service/youtube-url.service";
import { StorageService, Storage } from "../../service/storage.service";


type VideoId = string;

export interface Video {
  videoid: VideoId;
  oEmbed?: OEmbedResponseTypeVideo;
}

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css']
})
export class RequestBoxComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
  ) { }

  private index: number = 0;
  private dialogState: MatDialogState = MatDialogState.CLOSED;

  @Output() clickVideo = new EventEmitter<Video>();
  @Output() select = new EventEmitter<string>();
  @Output() deselect = new EventEmitter<string>();

  public videos = new Array<Video>();

  public get length(): number {
    return this.videos.length;
  }

  public async addRequest(...urls: Array<URL>): Promise<boolean> {
    for (const url of urls) {
      const videoid = YoutubeUrlService.getVideoId(url.href);
      if (videoid) {
        try {
          const v: Video = {
            videoid: videoid,
            oEmbed: await YoutubeUrlService.getVideoEmbed(url.href)
          };
          if (!this.exist(v)) {
            this.add(v);
          } else {
            console.info(`Duplicate video id '${videoid}'`);
          }
        } catch (error) {
          console.warn(error);
        }
      }
      StorageService.setItem(Storage.Playlist, this.toList());
    }
    return Promise.resolve(true);
  }

  public toList(): Array<string> {
    return this.videos.reduce((previous: string[], current: Video) => [...previous, current.videoid], []);
  }

  public add(video: Video): number {
    return this.videos.push(video);
  }

  public remove(video: Video): void {
    const i = this.videos.findIndex((v: Video) => v.videoid === video.videoid);
    if (i !== -1) {
      this.videos.splice(i, 1);
      StorageService.setItem(Storage.Playlist, this.toList());
    }
  }

  public exist(video: Video): boolean {
    return !this.videos.every((v: Video) => v.videoid !== video.videoid);
  }

  public has(): boolean {
    return this.videos[this.index] !== undefined;
  }

  public next(loop: boolean): Video {
    if (!(this.index < this.videos.length)) {
      if (loop) {
        this.index = 0;
      } else {
        this.index = this.videos.length - 1;
      }
    }
    return this.videos[this.index++];
  }

  public previous(loop: boolean): Video {
    if (this.index - 2 < 0) {
      if (loop) {
        this.index = this.videos.length + this.index - 2;
      } else {
        this.index = 0;
      }
    } else {
      this.index = this.index - 2;
    }
    return this.videos[this.index++];
  }

  public shuffle() {
    let i: number = this.videos.length;
    while (i) {
      const r: number = Math.floor(Math.random() * i--);
      [this.videos[i], this.videos[r]] = [this.videos[r], this.videos[i]];
    }
  }

  public onClickRequest(event: Video): void {
    const i = this.videos.findIndex((r: Video) => r.videoid === event.videoid);
    if (i !== -1) {
      this.index = i + 1;
    }
    this.clickVideo.emit(event);
  }

  public onClickDelete(video: Video, event: UIEvent): void {
    this.remove(video);
    event.stopPropagation();
  }

  public onClickAddButton(event: UIEvent): void {
    this.openDialog();
  }

  public onDrop(event: CdkDragDrop<Video[]>): void {
    moveItemInArray(this.videos, event.previousIndex, event.currentIndex);
  }

  ngOnInit(): void {
    const playlist: Array<string> = StorageService.getItem(Storage.Playlist);
    if (playlist !== null) {
      try {
        playlist.forEach((value: string) => {
          const url = YoutubeUrlService.getVideoUrl(value);
          this.addRequest(url);
        })
      } catch (error) {
        StorageService.setItem(Storage.Playlist, this.toList());
      }
    }
    const params = new URLSearchParams(window.location.search);
    const requests = params.get('requests');
    if (requests) {
      requests.split(',').forEach((value) => {
        const url = YoutubeUrlService.getVideoUrl(value);
        this.addRequest(url);
      })
    }
  }

  private openDialog(): void {
    const data: DialogData = {
      url: ''
    };
    const config: MatDialogConfig = {
      data: data,
      maxWidth: 390
    };
    const dialogRef = this.dialog.open(RequestDialogComponent, config);
    dialogRef.afterOpened().subscribe(() => {
      this.dialogState = MatDialogState.OPEN;
    });
    dialogRef.afterClosed().subscribe((result: DialogData) => {
      this.dialogState = MatDialogState.CLOSED;
      if (result) {
        try {
          this.addRequest(new URL(result.url));
        } catch (error) {
          console.warn(error);
        }
      }
    });
  }

  @HostListener('document:paste', ['$event'])
  private onPaste(event: ClipboardEvent): void {
    if (this.dialogState !== MatDialogState.OPEN) {
      const clipboardData = event.clipboardData;
      if (clipboardData) {
        const paste = clipboardData.getData('text');
        const urls = paste.split(/\r\n|\r|\n|\s/);
        for (const url of urls) {
          try {
            this.addRequest(new URL(url));
          } catch (error) {
            console.warn(error);
          }
        }
      }
    }
  }
}
