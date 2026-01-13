import { Component, OnInit } from '@angular/core';
import { ChannelEntity } from '../../models/channel.model';
import { ChannelNavCard } from '../../components/channel-nav-card/channel-nav-card';
import { ChannelProfil } from '../../components/channel-profil/channel-profil';

@Component({
  selector: 'app-channel-datail-page',
  standalone: true,
  imports: [ChannelNavCard, ChannelProfil],
  templateUrl: './channel-datail-page.html',
  styleUrl: './channel-datail-page.css'
})
export class ChannelDatailPage implements OnInit {
  otherChannels: ChannelEntity[] = [];
  channelInfos!: ChannelEntity;

  ngOnInit(): void {
    this.channelInfos = new ChannelEntity({
      id: 1,
      name: 'Tech Explained',
      creator_name: 'Alice Johnson',
      url: 'https://youtube.com/@techexplained',
      youtube_channel_id: 'UC123456789',
      description: 'Chaîne dédiée à la vulgarisation tech.',
      subs_count: 120000,
      video_count: 250,
      view_count: 5000000,
      created_at: '2023-01-15T12:00:00Z',
      logo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&auto=format',
      is_scrapping: true,
      date_updated: '2025-07-20T10:00:00Z',
      twitter: '@techexplained',
      instagram: '@techexplained.ig',
      facebook: null,
      linkedin: null,
      youtube: null,
      tiktok: null,
      mail: 'contact@techexplained.com',
      phone: '+1234567890',
      state: 1,
      prev_subs_count: 115000,
      prev_video_count: 240,
      prev_view_count: 4800000,
      user_id: 10,
      prev_date_visited: '2025-07-15T08:00:00Z',
      visited_at: '2025-07-20T10:00:00Z'
    });

    this.otherChannels = [
      this.channelInfos,
      new ChannelEntity({
        id: 2,
        name: 'CodeTalks',
        creator_name: 'Bob Dev',
        url: 'https://youtube.com/@codetalks',
        youtube_channel_id: 'UC987654321',
        description: 'Discussions sur le code et l’IA.',
        subs_count: 80000000,
        video_count: 180,
        view_count: 2000000,
        created_at: '2022-06-01T08:00:00Z',
        logo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&auto=format',
        is_scrapping: false,
        date_updated: '2025-07-19T14:30:00Z',
        twitter: '@codetalks',
        instagram: null,
        facebook: null,
        linkedin: null,
        youtube: null,
        tiktok: null,
        mail: 'bob@codetalks.dev',
        phone: null,
        state: 0,
        prev_subs_count: 75000,
        prev_video_count: 170,
        prev_view_count: 1900000,
        user_id: 11,
        prev_date_visited: '2025-07-14T09:00:00Z',
        visited_at: '2025-07-19T14:30:00Z'
      })
    ];
  }
}
