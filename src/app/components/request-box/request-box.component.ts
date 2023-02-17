import { Component, OnInit, Output, EventEmitter, Input, HostListener } from '@angular/core';

import { MatDialog, MatDialogConfig, MatDialogState } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { RequestDialogComponent, DialogData } from "../request-dialog/request-dialog.component";
import { YoutubeUrlService, OEmbedResponseTypeVideo } from "../../service/youtube-url.service";
import { StorageService, Storage } from "../../service/storage.service";

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css']
})
export class RequestBoxComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
  ) { }

  private dialogState: MatDialogState = MatDialogState.CLOSED;

  @Output() clickRequest = new EventEmitter<Request>();
  @Output() select = new EventEmitter<string>();
  @Output() deselect = new EventEmitter<string>();

  public requests: Requests = new Requests();

  ngOnInit(): void {
    const playlist: Array<string> = StorageService.getItem(Storage.Playlist);
    if (playlist !== null) {
      try {
        playlist.forEach((value: string) => {
          const url = YoutubeUrlService.getVideoUrl(value);
          this.addRequest(url);
        })
      } catch (error) {
        StorageService.setItem(Storage.Playlist, this.requests.toIdList());
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
          const r: Request = {
            videoid: videoid,
            oEmbed: await YoutubeUrlService.getVideoEmbed(url.href)
          };
          if (!this.requests.exist(r)) {
            this.requests.add(r);
          } else {
            console.info(`Duplicate video id '${videoid}'`);
          }
        } catch (error) {
          console.warn(error);
        }
      }
      StorageService.setItem(Storage.Playlist, this.requests.toIdList());
    }
    return Promise.resolve(true);
  }

  public removeRequest(request: Request): void {
    this.requests.remove(request);
    StorageService.setItem(Storage.Playlist, this.requests.toIdList());
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
    return this.requests.length;
  }

  public getAllRequests(): Array<string> {
    // return this.requests;
    return [];
  }

  public shuffleRequest(): void {
    // this.requests = shuffle(this.requests);
  }

  public onClickRequest(event: Request): void {
    console.debug('Click list item');
    this.clickRequest.emit(event);
  }

  public onClickDelete(event: Request): void {
    console.debug('Click list item delete');
    this.removeRequest(event);
  }

  /**
   * onClickAddButton
   */
  public onClickAddButton(event: UIEvent): void {
    this.openDialog();
  }

  public drop(event: CdkDragDrop<Request[]>): void {
    // console.debug(this.requests);
    moveItemInArray(this.requests, event.previousIndex, event.currentIndex);
    // console.debug(this.requests);
  }

  public getTitle(data: Request, name: string): string {
    if (data.oEmbed) {
      return data.oEmbed.title || '';
    }
    return '';
  }

  public getAuthor(data: Request, name: string): string {
    if (data.oEmbed) {
      return data.oEmbed.author_name || '';
    }
    return '';
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

export type VideoId = string;

export interface Request {
  videoid: VideoId;
  oEmbed?: OEmbedResponseTypeVideo;
}

export class Requests extends Array<Request> {
  private index: number;

  constructor(...requests: Request[]) {
    super(...requests);
    super.push(...requests || []);
    this.index = 0;
  }

  public toIdList(): Array<string> {
    const ids: string[] = [];
    this.forEach((request: Request) => {
      ids.push(request.videoid);
    });
    return ids;
  }

  public toJSON() {
    return Array.from(this);
  }

  public add(request: Request): number {
    return this.push(request);
  }

  public remove(request: Request): void {
    const i = this.findIndex((r: Request) => r.videoid === request.videoid);
    if (i !== -1) {
      this.splice(i, 1);
    }
  }

  public exist(request: Request): boolean {
    return !this.every((r: Request) => r.videoid !== request.videoid);
  }

  public next(loop: boolean): Request {
    if (loop && this.index === this.length) {
      this.index = 0;
    }
    return this[this.index++];
  }

  public previous(loop: boolean): Request {
    if (loop && this.index === 0) {
      this.index = this.length - 1;
    }
    return this[--this.index];
  }

  public has(): boolean {
    return this[this.index] !== undefined;
  }

  public shuffle() {
    let m: number = this.length;
    while (m) {
      const i: number = Math.floor(Math.random() * m--);
      [this[m], this[i]] = [this[i], this[m]];
    }
  }
}
