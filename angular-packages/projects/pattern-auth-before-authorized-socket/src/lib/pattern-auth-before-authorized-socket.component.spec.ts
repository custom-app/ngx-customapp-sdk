import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatternAuthBeforeAuthorizedSocketComponent } from './pattern-auth-before-authorized-socket.component';

describe('PatternAuthBeforeAuthorizedSocketComponent', () => {
  let component: PatternAuthBeforeAuthorizedSocketComponent;
  let fixture: ComponentFixture<PatternAuthBeforeAuthorizedSocketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatternAuthBeforeAuthorizedSocketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatternAuthBeforeAuthorizedSocketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
