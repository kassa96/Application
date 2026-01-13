import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesNav } from './categories-nav';

describe('CategoriesNav', () => {
  let component: CategoriesNav;
  let fixture: ComponentFixture<CategoriesNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
