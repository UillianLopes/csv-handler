import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChTableComponent } from './ch-table.component';

describe('ChTableComponent', () => {
  let component: ChTableComponent<any>;
  let fixture: ComponentFixture<ChTableComponent<any>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChTableComponent]
    });
    fixture = TestBed.createComponent(ChTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
