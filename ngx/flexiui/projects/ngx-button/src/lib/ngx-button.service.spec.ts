import { TestBed } from '@angular/core/testing';

import { NgxButtonService } from './ngx-button.service';

describe('NgxButtonService', () => {
  let service: NgxButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
