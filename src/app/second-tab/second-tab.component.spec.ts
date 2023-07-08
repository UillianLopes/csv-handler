import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondTabComponent } from './second-tab.component';

describe('SecondTabComponent', () => {
  let component: SecondTabComponent;
  let fixture: ComponentFixture<SecondTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecondTabComponent]
    });
    fixture = TestBed.createComponent(SecondTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
