import { TestBed } from '@angular/core/testing';

import { PatternAuthBeforeAuthorizedSocketService } from './pattern-auth-before-authorized-socket.service';

describe('PatternAuthBeforeAuthorizedSocketService', () => {
  let service: PatternAuthBeforeAuthorizedSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatternAuthBeforeAuthorizedSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
