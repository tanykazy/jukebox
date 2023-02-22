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

  ngOnInit(): void {
    const playlist: Array<string> = StorageService.getItem(Storage.Playlist);
    if (playlist !== null) {
      try {
        playlist.forEach((value: string) => {
          const url = YoutubeUrlService.getVideoUrl(value);
          this.addRequest(url);
        })
      } catch (error) {
        StorageService.setItem(Storage.Playlist, this.toIdList());
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
      StorageService.setItem(Storage.Playlist, this.toIdList());
    }
    return Promise.resolve(true);
  }

  public removeRequest(video: Video): void {
    this.remove(video);
    StorageService.setItem(Storage.Playlist, this.toIdList());
  }

  public getIndex(request: string): number {
    // const index = this.requests.indexOf(request);
    return 0;
  }

  public getRequest(index: number): string {
    // return this.requests[index];
    return '';
  }

  public getLength(): number {
    return this.videos.length;
  }

  public getAllRequests(): Array<string> {
    // return this.requests;
    return [];
  }

  public shuffleRequest(): void {
    // this.requests = shuffle(this.requests);
  }

  public onClickRequest(event: Video): void {
    console.debug('Click list item');
    const i = this.videos.findIndex((r: Video) => r.videoid === event.videoid);
    if (i !== -1) {
      this.index = i + 1;
    }
    this.clickVideo.emit(event);
  }

  public onClickDelete(video: Video, event: UIEvent): void {
    console.debug('Click list item delete');
    this.removeRequest(video);
    event.stopPropagation();
  }

  public onClickAddButton(event: UIEvent): void {
    this.openDialog();
  }

  public drop(event: CdkDragDrop<Video[]>): void {
    moveItemInArray(this.videos, event.previousIndex, event.currentIndex);
  }

  public toIdList(): Array<string> {
    const ids: string[] = [];
    this.videos.forEach((v: Video) => {
      ids.push(v.videoid);
    });
    return ids;
  }

  public toJSON() {
    return Array.from(this.videos);
  }

  public add(video: Video): number {
    return this.videos.push(video);
  }

  public remove(video: Video): void {
    const i = this.videos.findIndex((v: Video) => v.videoid === video.videoid);
    if (i !== -1) {
      this.videos.splice(i, 1);
    }
  }

  public exist(video: Video): boolean {
    return !this.videos.every((v: Video) => v.videoid !== video.videoid);
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

  public has(): boolean {
    return this.videos[this.index] !== undefined;
  }

  public shuffle() {
    let m: number = this.videos.length;
    while (m) {
      const i: number = Math.floor(Math.random() * m--);
      [this.videos[m], this.videos[i]] = [this.videos[i], this.videos[m]];
    }
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
            this.addRequest(new URL(url));
          } catch (error) {
            console.warn(error);
          }
        }
      }
    });
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
            this.addRequest(new URL(url));
          } catch (error) {
            console.warn(error);
          }
        }
      }
    }
  }
}
