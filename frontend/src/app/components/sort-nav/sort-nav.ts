import { Component, Output, EventEmitter, HostListener, Input } from '@angular/core';
import { CategoryService } from '../../services/category-service';

export interface SortOption {
  value: string;
  label: string;
}

export interface ActionEvent {
  type: 'suggestion' | 'category' | 'subcategory' | 'expertise' | 'language' | 'location' | 'sort';
  value?: string;
}


@Component({
  selector: 'app-sort-nav',
  imports: [],
  templateUrl: './sort-nav.html',
  styleUrl: './sort-nav.css'
})
export class SortNav {
  @Input() section: 'interviewer' | 'podcast' = 'podcast';
  @Output() actionEvent = new EventEmitter<ActionEvent>();

  isSuggestionActive = true;
  openDropdown: 'category' | 'subcategory' | 'expertise' | 'language' | 'sort'  | 'location' | null = null;

  selectedCategory = '';
  selectedSubcategory = '';
  selectedExpertise = '';
  selectedLanguage = '';
  selectedLocation = '';
  selectedSort = 'published_at|desc';

  categories: string[] = [];
  subcategories: string[] = [];
  expertises: string[] = [];
  languages: string[] = [];
  locations: string[] = [];


  sortOptions: SortOption[] = [
    { value: 'published_at|desc', label: 'Newest published first' },
    { value: 'published_at|asc', label: 'Oldest published first' },
    { value: 'video_count|desc', label: 'Video count (high → low)' },
    { value: 'video_count|asc', label: 'Video count (low → high)' },
    { value: 'view_count|desc', label: 'Views (high → low)' },
    { value: 'view_count|asc', label: 'Views (low → high)' },
    { value: 'like_count|desc', label: 'Likes (high → low)' },
    { value: 'like_count|asc', label: 'Likes (low → high)' }
  ];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    if (this.section === 'podcast') this.loadData('categories');
    if (this.section === 'interviewer') {    
      this.loadData('locations');  
      this.loadData('expertises');
    } 
    this.loadData('languages');
  }

private loadData(type: 'categories' | 'subcategories' | 'expertises' | 'languages' | 'locations', parentCategory?: string): void {
  const loaders = {
    categories: this.categoryService.loadMainCategories(),
    subcategories: this.categoryService.loadSubCategories(parentCategory ?? ''),
    expertises: this.categoryService.loadExpertises(),
    languages: this.categoryService.loadLanguages(),
    locations: this.categoryService.loadLocations(),   

  };

  loaders[type].subscribe({
    next: data => {
      this[type] = ['No choice', ...data];
    },
    error: err => console.error(`Error loading ${type}`, err)
  });
}


  private resetSelections(except?: 'category' | 'subcategory' | 'expertise' | 'language' | 'location'): void {
    if (except !== 'category') this.selectedCategory = '';
    if (except !== 'subcategory') this.selectedSubcategory = '';
    if (except !== 'expertise') this.selectedExpertise = '';
    if (except !== 'language') this.selectedLanguage = '';
    if (except !== 'location') this.selectedLocation = '';

  }

  getLabel(value: string, fallback = 'No choice'): string {
  return value || fallback;
}


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.openDropdown = null;
    }
  }

  onSuggestionClick(): void {
    this.isSuggestionActive = true;
    this.resetSelections();
    this.actionEvent.emit({ type: 'suggestion' });
  }

  toggleDropdown(type: 'category' | 'subcategory' | 'expertise' | 'language' | 'location' | 'sort'): void {
    this.openDropdown = this.openDropdown === type ? null : type;
  }

  selectCategory(category: string): void {
    this.resetSelections();
    if (category == "No choice"){
      category = ""
      this.selectedCategory = ""
    }
    this.isSuggestionActive = false;
    this.selectedCategory = category;
    this.openDropdown = null;
    this.actionEvent.emit({ type: 'category', value: category });
    this.loadData('subcategories', category);
  }

  selectSubcategory(subcategory: string): void {
    if (subcategory == "No choice"){
      subcategory = ""
      this.selectedSubcategory = ""
    }
    this.isSuggestionActive = false;
    this.selectedSubcategory = subcategory;
    this.openDropdown = null;
    this.actionEvent.emit({ type: 'subcategory', value: subcategory });
  }

  selectExpertise(expertise: string): void {
    this.resetSelections();
    if (expertise == "No choice"){
      expertise = ""
      this.selectedExpertise = ""
    }
    this.isSuggestionActive = false;
    this.selectedExpertise = expertise;
    this.openDropdown = null;
    this.actionEvent.emit({ type: 'expertise', value: expertise });
  }

  selectLanguage(language: string): void {
    this.resetSelections();
    if (language == "No choice"){
      language = ""
      this.selectedLanguage = ""
    }
    this.isSuggestionActive = false;
    this.selectedLanguage = language;
    this.openDropdown = null;
    this.actionEvent.emit({ type: 'language', value: language });
  }

  selectLocation(location: string): void {
    this.resetSelections();
    if (location == "No choice") {
      location = "";
      this.selectedLocation = "";
    }
    this.isSuggestionActive = false;
    this.selectedLocation = location;
    this.openDropdown = null;
    this.actionEvent.emit({ type: 'location', value: location });
  }

  selectSortOption(option: SortOption): void {
    this.selectedSort = option.value;
    this.openDropdown = null;
    this.actionEvent.emit({ type: 'sort', value: option.value });
  }

  getCurrentSortLabel(): string {
    return this.sortOptions.find(o => o.value === this.selectedSort)?.label || 'Select sort';
  }
}
