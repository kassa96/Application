
SELECT *
FROM Interviewer
WHERE Name IN (
    SELECT Name
    FROM Interviewer
    GROUP BY Name
    HAVING COUNT(*) > 1
)
ORDER BY Name;
select count(*) from channel inner join video 
                      on channel.id = video.channel_id
                      inner join interviewervideolink
                      on video.id = interviewervideolink.video_id
                      inner join interviewer
                      on interviewervideolink.interviewer_id = interviewer.id
                      where channel.id = 8;
select count(*) from interviewer;
select count(*) from interviewervideolink;
select COUNT(*) from interviewer where is_hoster is not null;
select video.id, video.is_podcast from video left join interviewervideolink on video.id = interviewervideolink.video_id where video_id is null and video.is_podcast is not null; 
select count(*) from video where title is not null and is_podcast is null;
select is_hoster from interviewer where name = 'Jay Shetty';

-- Requête pour obtenir le dernier vidéo d'un interviewer spécifique
SELECT 
    i.id as interviewer_id,
    i.name as interviewer_name,
    v.id as video_id,
    v.title as video_title,
    v.url as video_url,
    v.description,
    v.topic,
    v.main_category,
    v.category,
    v.duration,
    v.view_count,
    v.like_count,
    v.published_at,
    v.logo_url,
    c.name as channel_name
FROM interviewer i
JOIN interviewervideolink ivl ON i.id = ivl.interviewer_id
JOIN video v ON v.id = ivl.video_id
JOIN channel c ON c.id = v.channel_id
WHERE i.id = 418 -- Remplacer par l'ID de l'interviewer
  AND v.is_podcast = true
ORDER BY v.published_at DESC
LIMIT 1;

SELECT COUNT(*)
FROM interviewer
  where (
      interviewer.linkedin LIKE '%|existed'
      OR interviewer.twitter LIKE '%|existed'
      OR interviewer.instagram LIKE '%|existed'
      OR interviewer.tiktok LIKE '%|existed'
      OR interviewer.youtube LIKE '%|existed'
  )
;


select count(*) from interviewer where  interviewer.linkedin LIKE '%|not_checked';
select count(*) from interviewer where  interviewer.twitter LIKE '%|not_checked';
select count(*) from interviewer where  interviewer.instagram LIKE '%|not_checked';
select count(*) from interviewer where  interviewer.tiktok LIKE '%|not_checked';
select count(*) from interviewer where  interviewer.facebook LIKE '%|not_checked';
select count(*) from interviewer where  interviewer.linkedin LIKE '%|existed';
select count(*) from interviewer;
select count(*) from video where is_podcast is null and title is not null;
select linkedin from interviewer where  interviewer.linkedin NOT LIKE '%|not_checked';
select count(*) from interviewer where  interviewer.linkedin LIKE '%|not_checked';
