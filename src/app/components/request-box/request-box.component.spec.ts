import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestBoxComponent } from './request-box.component';

describe('RequestBoxComponent', () => {
  let component: RequestBoxComponent;
  let fixture: ComponentFixture<RequestBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
