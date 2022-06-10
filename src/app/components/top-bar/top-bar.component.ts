import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { MatSliderChange } from "@angular/material/slider";

import { StorageService } from "../../service/storage.service";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  @Input() appName: string | undefined;

  @Input() volume: number = 0;
  @Output() volumeChange: EventEmitter<number> = new EventEmitter();
  @Input() muted: boolean = false;
  @Output() mutedChange: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    const volume: Volume = StorageService.getItem('volume');
    if (volume) {
      this.volume = volume.value;
      this.muted = volume.muted;
    }
  }

  onInputSlider(event: MatSliderChange): void {
    if (event.value !== null) {
      this.volume = event.value;
      this.volumeChange.emit(this.volume);
      this.saveVolume({
        value: this.volume,
        muted: this.muted
      });
    }
  }

  onClickVolume(event: UIEvent): void {
    this.muted = !this.muted;
    this.mutedChange.emit(this.muted);
    this.saveVolume({
      value: this.volume,
      muted: this.muted
    });
  }

  private saveVolume(volume: Volume): void {
    StorageService.setItem('volume', volume);
  }
}

interface Volume {
  value: number;
  muted: boolean;
}
