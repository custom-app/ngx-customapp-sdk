import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoHttpComponent } from './proto-http.component';

describe('ProtoHttpComponent', () => {
  let component: ProtoHttpComponent;
  let fixture: ComponentFixture<ProtoHttpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProtoHttpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoHttpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
