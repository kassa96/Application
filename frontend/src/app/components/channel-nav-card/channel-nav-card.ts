import { Component, Input } from '@angular/core';
import { ChannelEntity } from '../../models/channel.model';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-channel-nav-card',
  imports: [DecimalPipe],
  templateUrl: './channel-nav-card.html',
  styleUrl: './channel-nav-card.css'
})
export class ChannelNavCard {
@Input() otherChannel!: ChannelEntity
}
