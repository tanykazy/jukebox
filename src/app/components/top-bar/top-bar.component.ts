import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {

  constructor() { }

  @Input() appName: string | undefined;

  @Output() share = new EventEmitter<UIEvent>();

  /**
   * onClickShareButton
   */
  public onClickShareButton(event: UIEvent): void {
    console.debug('Click share button');
    this.share.emit(event);
  }
}
