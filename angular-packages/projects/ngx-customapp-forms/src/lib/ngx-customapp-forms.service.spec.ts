import { TestBed } from '@angular/core/testing';

import { NgxCustomappFormsService } from './ngx-customapp-forms.service';

describe('NgxCustomappFormsService', () => {
  let service: NgxCustomappFormsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxCustomappFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
