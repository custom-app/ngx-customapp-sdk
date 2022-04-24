import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxCustomappFormsComponent } from './ngx-customapp-forms.component';

describe('NgxCustomappFormsComponent', () => {
  let component: NgxCustomappFormsComponent;
  let fixture: ComponentFixture<NgxCustomappFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxCustomappFormsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxCustomappFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
