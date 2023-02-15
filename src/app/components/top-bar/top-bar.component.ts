import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
  @Input() appName: string | undefined;

  @Output() share: EventEmitter<UIEvent> = new EventEmitter();

  constructor() { }

  /**
   * onClickShareButton
   */
  public onClickShareButton(event: UIEvent): void {
    console.debug('Click share button');
    this.share.emit(event);
  }

  /**
   * onBackdropClick
   */
  public onBackdropClick(event:any) {
    console.log(event);
  }
}
