import { Component, OnInit, Output, EventEmitter, ViewChild, Input, IterableDiffers, DoCheck, IterableDiffer } from '@angular/core';
import { MatChip, MatChipInputEvent, MatChipList, MatChipSelectionChange } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { YoutubeUrlService } from "../../service/youtube-url.service";
import { StorageService, Storage } from "../../service/storage.service";

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css']
})
export class RequestBoxComponent implements OnInit, DoCheck {
  @ViewChild(MatChipList) chipList!: MatChipList;

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

          if (!this.requests.includes(videoid)) {
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

  public remove(request: string, chip: MatChip): void {
    chip.deselect();
    this.requests = this.requests.filter((element) => element !== request);
    this.requestsChange.emit(this.requests);
    this.updateStorage(this.requests);
  }

  public onChipClick(chip: MatChip): void {
    // chip.toggleSelected();
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
  displayedColumns: string[] = [''];
}

export interface VideoInfo {
  videoid: string;
  oEmbed: OEmbedResponseTypeVideo;
}

interface OEmbedResponse {
  type: '';
  version: '1.0';
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  cache_age?: number;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

interface OEmbedResponseTypeVideo extends OEmbedResponse {
  html: string;
  width: number;
  height: number;
}
