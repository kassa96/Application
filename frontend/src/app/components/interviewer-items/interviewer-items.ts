import { Component, Input } from '@angular/core';
import { InterviewerEntity } from '../../models/entity.model';

@Component({
  selector: 'app-interviewer-items',
  imports: [],
  templateUrl: './interviewer-items.html',
  styleUrl: './interviewer-items.css'
})
export class InterviewerItems {
@Input() otherInterviewer! : InterviewerEntity
}
