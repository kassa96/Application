import json
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from dotenv import load_dotenv
import os

load_dotenv()
api_youtube_key = os.getenv('YOUTUBE_API_KEY')

def get_channel_id(channel_name):
    youtube = build('youtube', 'v3', developerKey=api_youtube_key )
    try:
        request = youtube.search().list(
            part='snippet',
            q=channel_name,
            type='channel'
        )
        response = request.execute()

        if 'items' in response and response['items']:
            channel = response['items'][0]
            channel_id = channel['id']['channelId']
            return channel_id
    except HttpError as e:
        print(f"Error: {e}")
    return None

def update_stat_channel(channel_id):
    youtube = build('youtube', 'v3', developerKey=api_youtube_key)
    try:
        request = youtube.channels().list(
            part='statistics', 
            id=channel_id
        )
        response = request.execute()
        if 'items' in response:
            channel = response['items'][0]
            stats = {
                'subs_count': int(channel['statistics']['subscriberCount']),  
                'view_count': int(channel['statistics']['viewCount']),  
                'video_count': int(channel['statistics']['videoCount']) 
            }            
            return stats
    except HttpError as e:
        print(f"Error: {e}")
    return None


def update_stat_video(video_id):
    try:
        API_SERVICE_NAME = "youtube"
        API_VERSION = "v3"
        youtube = build(API_SERVICE_NAME, API_VERSION, developerKey=api_youtube_key)
        request = youtube.videos().list(
            part="statistics,contentDetails", 
            id=video_id
        )
        response = request.execute()
        if not response.get('items'):
            return None, "Video info not exist or access denied"
        video_info = response['items'][0]
        view_count = video_info['statistics']['viewCount']
        like_count = video_info['statistics'].get('likeCount', 0)  
        duration = convert_iso_duration(video_info['contentDetails']['duration'])
        video_stats = {
            "id": video_id,
            "view_count": view_count,
            "like_count": like_count,
            "duration": duration
        }
        print("update stat:::", video_stats)
        return video_stats, None  
    except HttpError as e:
        error_json = e.content.decode('utf-8')
        error = json.loads(error_json)['error']
        error_message = error['message']
        return None, error_message  
    except Exception as e:
        return None, f"Unexpected Error: {str(e)}"
    

def convert_iso_duration(duration):
    hours = 0
    minutes = 0
    seconds = 0
    duration = duration[2:]  # Remove 'PT' at the beginning
    while duration:
        value = ""
        while duration and duration[0].isdigit():
            value += duration[0]
            duration = duration[1:]
        if duration:
            unit = duration[0]
            duration = duration[1:]
            if unit == 'H':
                hours = int(value)
            elif unit == 'M':
                minutes = int(value)
            elif unit == 'S':
                seconds = int(value)
    return "{:02}:{:02}:{:02}".format(hours, minutes, seconds)



