import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelProfil } from './channel-profil';

describe('ChannelProfil', () => {
  let component: ChannelProfil;
  let fixture: ComponentFixture<ChannelProfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelProfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelProfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
