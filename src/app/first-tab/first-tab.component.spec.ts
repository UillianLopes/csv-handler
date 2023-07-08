import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstTabComponent } from './first-tab.component';

describe('FirstTabComponent', () => {
  let component: FirstTabComponent;
  let fixture: ComponentFixture<FirstTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirstTabComponent]
    });
    fixture = TestBed.createComponent(FirstTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
