import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelDatailPage } from './channel-datail-page';

describe('ChannelDatailPage', () => {
  let component: ChannelDatailPage;
  let fixture: ComponentFixture<ChannelDatailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelDatailPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelDatailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
