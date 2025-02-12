import { TestBed } from '@angular/core/testing';

import { NgxQuoteService } from './ngx-quote.service';

describe('NgxQuoteService', () => {
  let service: NgxQuoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxQuoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
