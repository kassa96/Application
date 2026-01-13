import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastList } from './podcast-list';

describe('PodcastList', () => {
  let component: PodcastList;
  let fixture: ComponentFixture<PodcastList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
