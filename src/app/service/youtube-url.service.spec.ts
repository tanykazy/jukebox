import { TestBed } from '@angular/core/testing';

import { YoutubeUrlService } from './youtube-url.service';

describe('YoutubeUrlService', () => {
  let service: YoutubeUrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YoutubeUrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
