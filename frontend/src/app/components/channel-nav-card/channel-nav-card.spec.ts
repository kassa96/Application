import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelNavCard } from './channel-nav-card';

describe('ChannelNavCard', () => {
  let component: ChannelNavCard;
  let fixture: ComponentFixture<ChannelNavCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelNavCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelNavCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
