import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewerProfil } from './interviewer-profil';

describe('InterviewerProfil', () => {
  let component: InterviewerProfil;
  let fixture: ComponentFixture<InterviewerProfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewerProfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewerProfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
