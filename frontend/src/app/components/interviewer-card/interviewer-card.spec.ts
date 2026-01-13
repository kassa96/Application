import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewerCard } from './interviewer-card';

describe('InterviewerCard', () => {
  let component: InterviewerCard;
  let fixture: ComponentFixture<InterviewerCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewerCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewerCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
