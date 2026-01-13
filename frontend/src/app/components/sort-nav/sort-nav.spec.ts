import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortNav } from './sort-nav';

describe('SortNav', () => {
  let component: SortNav;
  let fixture: ComponentFixture<SortNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
