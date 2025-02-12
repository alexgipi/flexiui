import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxQuoteComponent } from './ngx-quote.component';

describe('NgxQuoteComponent', () => {
  let component: NgxQuoteComponent;
  let fixture: ComponentFixture<NgxQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxQuoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
