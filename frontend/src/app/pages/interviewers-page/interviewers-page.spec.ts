import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewersPage } from './interviewers-page';

describe('IneterviewersPage', () => {
  let component: InterviewersPage;
  let fixture: ComponentFixture<InterviewersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewersPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
