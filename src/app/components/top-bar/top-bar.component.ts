import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { MatSliderChange } from "@angular/material/slider";

import { StorageService, Storage } from "../../service/storage.service";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  @Input() appName: string | undefined;

  @Input() settings!: Settings;
  @Output() settingsChange: EventEmitter<Settings> = new EventEmitter();
  @Output() controlEvent: EventEmitter<Control> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    const settings: Settings = StorageService.getItem(Storage.Settings);
    if (settings) {
      this.settings = settings;
    }
  }

  onClickSkipPrevious(event: UIEvent): void {
    this.controlEvent.emit(Control.SkipPrevious);
  }

  onClickStop(event: UIEvent): void {
    this.controlEvent.emit(Control.Stop);
  }

  onClickPlay(event: UIEvent): void {
    this.controlEvent.emit(Control.Play);
  }

  onClickPause(event: UIEvent): void {
    this.controlEvent.emit(Control.Pause);
  }

  onClickSkipNext(event: UIEvent): void {
    this.controlEvent.emit(Control.SkipNext);
  }

  onClickShuffle(event: UIEvent): void {
    this.settings.shuffle = !this.settings.shuffle;
    this.settingsChange.emit(this.settings);
    this.saveSettings(this.settings);
  }

  onClickRepeat(event: UIEvent): void {
    this.settings.repeat = (this.settings.repeat + 1) % 3;
    this.settingsChange.emit(this.settings);
    this.saveSettings(this.settings);
  }

  onClickVolume(event: UIEvent): void {
    this.settings.volume.muted = !this.settings.volume.muted;
    this.settingsChange.emit(this.settings);
    this.saveSettings(this.settings);
  }

  onInputSlider(event: MatSliderChange): void {
    if (event.value !== null) {
      this.settings.volume.value = event.value;
      this.settingsChange.emit(this.settings);
      this.saveSettings(this.settings);
    }
  }

  private saveSettings(settings: Settings): void {
    StorageService.setItem(Storage.Settings, settings);
  }
}

const Control = {
  SkipPrevious: 'SKIPPREVIOUS',
  Stop: 'STOP',
  Play: 'PLAY',
  Pause: 'PAUSE',
  SkipNext: 'SKIPNEXT',
} as const;
export type Control = typeof Control[keyof typeof Control];

export class Settings {
  public volume: Volume;
  public repeat: number = 0;
  public shuffle: boolean = false;

  constructor() {
    this.volume = new Volume();
  }
}

class Volume {
  public value: number = 50;
  public muted: boolean = false;
}
