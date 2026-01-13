import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './filter.html',
  styleUrls: ['./filter.css'] 
})
export class FilterComponent {
  @Input() professionList!: string[];
  @Input() languageList!: string[];

  @Output() searchChanged = new EventEmitter<string>();
  @Output() professionChanged = new EventEmitter<string>();
  @Output() languageChanged = new EventEmitter<string>();

  searchTerm: string = '';
  selectedProfession: string = 'entrepreneur';
  selectedLanguage: string = 'french';

  onSearchInputChange() {
    this.searchChanged.emit(this.searchTerm);
  }

  onProfessionSelect(profession: string) {
    this.selectedProfession = profession;
    this.professionChanged.emit(this.selectedProfession);
  }

  onLanguageSelect(language: string) {
    this.selectedLanguage = language;
    this.languageChanged.emit(this.selectedLanguage);
  }
}
