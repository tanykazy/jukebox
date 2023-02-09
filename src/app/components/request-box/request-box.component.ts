import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { YoutubeUrlService, OEmbedResponseTypeVideo } from "../../service/youtube-url.service";
import { StorageService, Storage } from "../../service/storage.service";

export interface Size {
  width: number;
  height: number;
}

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css']
})
export class RequestBoxComponent implements OnInit {
  @Input() size!: Size;

  @Output() clickRequest: EventEmitter<Request> = new EventEmitter();
  @Output() select: EventEmitter<string> = new EventEmitter();
  @Output() deselect: EventEmitter<string> = new EventEmitter();

  public requests: Requests = new Requests();

  constructor() {
  }

  ngOnInit(): void {
    const playlist = StorageService.getItem(Storage.Playlist);
    if (playlist !== null) {
      try {
        playlist.forEach((value: string) => {
          const url = YoutubeUrlService.getVideoUrl(value);
          this.addRequest(url);
        })
      } catch (error) {
        this.updateStorage(this.requests);
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
      this.updateStorage(this.requests);
    }
    return Promise.resolve(true);
  }

  public removeRequest(request: Request): void {
    this.requests.remove(request);
    this.updateStorage(this.requests);
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
    this.clickRequest.emit(event);
  }

  public onClickDelete(event: Request): void {
    this.removeRequest(event);
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.requests, event.previousIndex, event.currentIndex);
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

  private updateStorage(requests: Requests): void {
    StorageService.setItem(Storage.Playlist, requests.toIdList());
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
