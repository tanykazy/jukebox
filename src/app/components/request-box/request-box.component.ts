import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { MatChip, MatChipInputEvent, MatChipList, MatChipSelectionChange } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { YoutubeUrlService } from "../../service/youtube-url.service";
import { StorageService } from "../../service/storage.service";

@Component({
  selector: 'app-request-box',
  templateUrl: './request-box.component.html',
  styleUrls: ['./request-box.component.css']
})
export class RequestBoxComponent implements OnInit {
  @ViewChild(MatChipList) chipList!: MatChipList;

  @Input() requests: Set<string> = new Set();
  @Output() requestsChange: EventEmitter<Set<string>> = new EventEmitter();

  @Output() select: EventEmitter<string> = new EventEmitter();
  @Output() deselect: EventEmitter<string> = new EventEmitter();

  readonly selectable: boolean = true;
  readonly removable: boolean = true;
  readonly addOnBlur: boolean = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  public value: string = '';
  // public requests: Set<string> = new Set();

  constructor() { }

  ngOnInit(): void {
    const playlist = StorageService.getItem('playlist');
    if (playlist !== null) {
      try {
        this.requests = new Set(playlist);
      } catch (error) {
        this.updateStorage(this.requests);
      }
      this.requestsChange.emit(this.requests);
    }
  }

  private updateStorage(values: Set<string>): void {
    StorageService.setItem('playlist', [...values]);
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

  public getShuffle(): string | null {
    this.chipList.chips.forEach((item: MatChip) => {
      item.deselect();
    });
    if (this.requests.size !== 0) {
      const random = Math.floor(Math.random() * this.requests.size);
      const videoid = [...this.requests][random];
      const chip = this.getChipByValue(videoid);
      if (chip) {
        chip.deselect();
      }
      return videoid;
    } else {
      return null;
    }
  }

  public addRequestFromInput(event: MatChipInputEvent): void {
    if (event.value) {
      const requests = event.value.split(/\r\n|\r|\n|\s/);
      for (let request of requests) {
        const videoid = YoutubeUrlService.getVideoId(request);
        if (videoid) {
          this.requests.add(videoid);
          this.requestsChange.emit(this.requests);
        }
      }
      this.updateStorage(this.requests);
      event.chipInput!.clear();
    }
  }

  public remove(request: string, chip: MatChip): void {
    chip.deselect();
    this.requests.delete(request);
    this.requestsChange.emit(this.requests);
    this.updateStorage(this.requests);
  }

  public onChipClick(chip: MatChip): void {
    chip.toggleSelected();
  }

  public onSelectionChange(event: MatChipSelectionChange): void {
    if (event.selected) {
      this.select.emit(event.source.value);
    } else {
      this.deselect.emit(event.source.value);
    }
  }
}
