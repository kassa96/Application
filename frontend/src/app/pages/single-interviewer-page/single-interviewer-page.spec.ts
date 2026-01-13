import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleInterviewerPage } from './single-interviewer-page';

describe('SingleInterviewerPage', () => {
  let component: SingleInterviewerPage;
  let fixture: ComponentFixture<SingleInterviewerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleInterviewerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleInterviewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
