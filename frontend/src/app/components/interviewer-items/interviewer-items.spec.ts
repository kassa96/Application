import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewerItems } from './interviewer-items';

describe('InterviewerItems', () => {
  let component: InterviewerItems;
  let fixture: ComponentFixture<InterviewerItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewerItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewerItems);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
