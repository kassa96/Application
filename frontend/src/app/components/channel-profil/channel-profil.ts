import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChannelEntity } from '../../models/channel.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { formatDistanceStrict } from 'date-fns';

@Component({
  selector: 'app-channel-profil',
  standalone: true,
  templateUrl: './channel-profil.html',
  styleUrl: './channel-profil.css',
  imports: [DatePipe, DecimalPipe]
})
export class ChannelProfil implements OnChanges {
  @Input() channelInfos!: ChannelEntity;

  growth = {
    subs: 0,
    videos: 0,
    views: 0
  };

  startDate = '';
  endDate = '';
  durationLabel = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelInfos'] && this.channelInfos) {
      this.growth = {
        subs: this.calculateGrowth(this.channelInfos.prev_subs_count, this.channelInfos.subs_count),
        videos: this.calculateGrowth(this.channelInfos.prev_video_count, this.channelInfos.video_count),
        views: this.calculateGrowth(this.channelInfos.prev_view_count, this.channelInfos.view_count)
      };

      const prevDate = this.channelInfos.prev_date_visited ? new Date(this.channelInfos.prev_date_visited) : null;
      const currentDate = this.channelInfos.visited_at ? new Date(this.channelInfos.visited_at) : null;

      if (prevDate && currentDate) {
        this.startDate = prevDate.toLocaleDateString();
        this.endDate = currentDate.toLocaleDateString();
        this.durationLabel = formatDistanceStrict(prevDate, currentDate);
      }
    }
  }

  calculateGrowth(prev: number | null | undefined, current: number | null | undefined): number {
    if (
      prev === null || prev === undefined ||
      current === null || current === undefined ||
      prev === 0
    ) {
      return 0;
    }

    const growth = ((current - prev) / prev) * 100;
    return Math.round(growth * 10) / 10;
  }

  getTrendClass(value: number): string {
    if (value > 0) return 'text-green-600 fas fa-arrow-up';
    if (value < 0) return 'text-red-600 fas fa-arrow-down';
    return 'text-gray-400 fas fa-minus';
  }
}
