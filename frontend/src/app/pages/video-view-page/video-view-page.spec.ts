import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoViewPage } from './video-view-page';

describe('VideoViewPage', () => {
  let component: VideoViewPage;
  let fixture: ComponentFixture<VideoViewPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoViewPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
