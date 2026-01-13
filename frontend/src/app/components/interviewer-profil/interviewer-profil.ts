import { Component, Input } from '@angular/core';
import { InterviewerEntity } from '../../models/entity.model';

@Component({
  selector: 'app-interviewer-profil',
  imports: [],
  templateUrl: './interviewer-profil.html',
  styleUrl: './interviewer-profil.css'
})
export class InterviewerProfil {
@Input() interviewer!: InterviewerEntity
showModal = false;

}
