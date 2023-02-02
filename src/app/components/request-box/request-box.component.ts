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
export class RequestBoxComponent implements OnInit, DoCheck {
  @ViewChild(MatChipList) chipList!: MatChipList;

  // @Input() requests: Requests = new Requests();
  @Input() requests: Array<string> = new Array();
  @Output() requestsChange: EventEmitter<Array<string>> = new EventEmitter();

  @Output() select: EventEmitter<string> = new EventEmitter();
  @Output() deselect: EventEmitter<string> = new EventEmitter();

  readonly selectable: boolean = true;
  readonly removable: boolean = true;
  readonly addOnBlur: boolean = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  public value: string = '';

  private iterableDiffer: IterableDiffer<string>;

  constructor(private iterableDiffers: IterableDiffers) {
    this.iterableDiffer = this.iterableDiffers.find(this.requests).create();
  }

  ngOnInit(): void {
    const playlist = StorageService.getItem(Storage.Playlist);
    if (playlist !== null) {
      try {
        this.requests = Array.from(playlist);
      } catch (error) {
        this.updateStorage(this.requests);
      }
      this.requestsChange.emit(this.requests);
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

  ngDoCheck(): void {
    if (this.iterableDiffer) {
      const changes = this.iterableDiffer.diff(this.requests);
      if (changes) {
        this.updateStorage(this.requests);
      }
    }
  }

  public async addRequest(value: string): Promise<boolean> {
    if (value) {
      const requests = value.split(/\r\n|\r|\n|\s/);
      for (const request of requests) {
        const videoid = YoutubeUrlService.getVideoId(request);
        if (videoid) {

          const result = await YoutubeUrlService.getVideoEmbed(value);
          console.warn(result);

          // const div = window.document.createElement('div');
          // const iframe = window.document.createElement('iframe');
          // div.appendChild(iframe);
          // console.log(div);
          // iframe.outerHTML = result.html;
          // console.log(div.firstChild);
          // console.log((div.firstChild as HTMLIFrameElement).src);
          //<iframe width="200" height="113" src="https://www.youtube.com/embed/ZZ_hity8FUw?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="カネヨリマサル『関係のない人』MV"></iframe>

          if (!this.requests.includes(videoid)) {
            // this.requests.push(videoid);
            this.requests.push(videoid);
            this.requestsChange.emit(this.requests);
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
    this.requests = this.requests.filter((element) => element !== request);
    this.requestsChange.emit(this.requests);
    this.updateStorage(this.requests);
  }

  public shuffleRequest(): void {
    this.requests = shuffle(this.requests);
  }

  public remove(request: string, chip: MatChip): void {
    chip.deselect();
    this.removeRequest(request);
  }

  public onSelectionChange(event: MatChipSelectionChange): void {
    if (event.selected) {
      this.select.emit(event.source.value);
    } else {
      this.deselect.emit(event.source.value);
    }
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

  private updateStorage(values: Array<string>): void {
    StorageService.setItem(Storage.Playlist, [...values]);
  }

  private getChipByValue(value: string): MatChip | null {
    let chip: MatChip | null = null;
    this.chipList.chips.forEach((item: MatChip) => {
      if (item.value === value) {
        chip = item;
      }
    });
    return chip;
  }




  // displayedColumns: string[] = ['name'];
  // dataSource = ELEMENT_DATA;
  public displayedColumns: string[] = ['Title', 'Author'];
  public __request: Request[] = [];

}

// class Request {
//   constructor(videoid: string) {
//     this.videoid = videoid;
//   }

//   public set videoid(videoid: string) {
//     this._videoid = videoid;
//   }
//   public get videoid(): string {
//     return this._videoid;
//   }
//   private _videoid: string = '';

//   private oEmbed: OEmbedResponseTypeVideo | undefined;
// }

export interface Request extends OEmbedResponseTypeVideo {
  videoid: string;
}

export class Requests extends Array<Request> {
  constructor(...requests: Request[]) {
    super(...requests);
    super.push(...requests || []);
    // this._requests = requests || [];
  }

  // private _requests: Request[];

  public add(request: Request): number {
    // this._requests.push(request);
    return this.push(request);
  }

  public remove(request: Request): void {
    // this._requests = this._requests.filter((r: Request) => r !== request);
     this.filter((r: Request) => r !== request);
  }
}

function shuffle(array: Array<any>): Array<any> {
  let m: number = array.length;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    const i: number = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    [array[m], array[i]] = [array[i], array[m]];
  }
  return array;
}
