import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-request-dialog',
  templateUrl: './request-dialog.component.html',
  styleUrls: ['./request-dialog.component.css']
})
export class RequestDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  public onClickCancel(event: UIEvent): void {
    this.dialogRef.close();
  }
}

export interface DialogData {
  url: string;
}