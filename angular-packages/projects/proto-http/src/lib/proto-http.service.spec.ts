import { TestBed } from '@angular/core/testing';

import { ProtoHttpService } from './proto-http.service';

describe('ProtoHttpService', () => {
  let service: ProtoHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProtoHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
