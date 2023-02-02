import { Component, OnInit, Output, EventEmitter, ViewChild, Input, IterableDiffers, DoCheck, IterableDiffer } from '@angular/core';
import { MatChip, MatChipInputEvent, MatChipList, MatChipSelectionChange } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { YoutubeUrlService, OEmbedResponseTypeVideo } from "../../service/youtube-url.service";
import { StorageService, Storage } from "../../service/storage.service";

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css']
})
export class RequestBoxComponent implements OnInit {
  @ViewChild(MatChipList) chipList!: MatChipList;

  public requests: Requests = new Requests();
  // @Input() requests: Array<string> = new Array();
  // @Output() requestsChange: EventEmitter<Array<string>> = new EventEmitter();

  @Output() select: EventEmitter<string> = new EventEmitter();
  @Output() deselect: EventEmitter<string> = new EventEmitter();

  readonly selectable: boolean = true;
  readonly removable: boolean = true;
  readonly addOnBlur: boolean = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  public value: string = '';

  public displayedColumns: string[] = ['Title', 'Author'];

  constructor() {
  }

  ngOnInit(): void {
    const playlist = StorageService.getItem(Storage.Playlist);
    if (playlist !== null) {
      try {
        playlist.forEach((value: string) => {
          this.requests.add({
            videoid: value
          });
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
        this.addRequest(url.href);
      })
    }
  }

  public async addRequest(value: string): Promise<boolean> {
    if (value) {
      const requests = value.split(/\r\n|\r|\n|\s/);
      for (const request of requests) {
        const videoid = YoutubeUrlService.getVideoId(request);
        if (videoid) {
          const request: Request = { videoid: videoid };

          // const result = await YoutubeUrlService.getVideoEmbed(value);
          // console.warn(result);

          // const div = window.document.createElement('div');
          // const iframe = window.document.createElement('iframe');
          // div.appendChild(iframe);
          // console.log(div);
          // iframe.outerHTML = result.html;
          // console.log(div.firstChild);
          // console.log((div.firstChild as HTMLIFrameElement).src);
          //<iframe width="200" height="113" src="https://www.youtube.com/embed/ZZ_hity8FUw?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="カネヨリマサル『関係のない人』MV"></iframe>

          if (!this.requests.includes(request)) {
            this.requests.add(request);
          }
        }
      }
      this.updateStorage(this.requests);
    }
    return Promise.resolve(true);
  }

  public addRequestFromInput(event: MatChipInputEvent): void {
    if (event.value) {
      this.addRequest(event.value);
      event.chipInput!.clear();
    }
  }

  public removeRequest(request: string): void {
    this.requests.remove({ videoid: request });
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

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.requests, event.previousIndex, event.currentIndex);
  }

  public getTitle(data: string): string {
    console.log(data);
    return data;
  }

  public getAuthor(data: string): string {
    console.log(data);
    return data;
  }

  // private updateStorage(values: Array<string>): void {
  private updateStorage(requests: Requests): void {
    StorageService.setItem(Storage.Playlist, requests);
  }
}

export interface Request {
  videoid: string;
}

export class Requests extends Array<Request> {
  private index: number;

  constructor(...requests: Request[]) {
    super(...requests);
    super.push(...requests || []);
    this.index = 0;
  }

  public toString(): string {
    return this.join();
  }

  public toJSON() {
    return Array.from(this);
  }

  public add(request: Request): number {
    return this.push(request);
  }

  public remove(request: Request): void {
    // this._requests = this._requests.filter((r: Request) => r !== request);
    this.filter((r: Request) => r !== request);
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
    return this[--this.index]
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
