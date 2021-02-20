import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  videoId: string = '';

  onSubmit(event: any): void {
    console.log(event);

    this.videoId = event;
  }

}
