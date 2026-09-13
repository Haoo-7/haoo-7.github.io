import { describe, expect, it } from 'vitest';
import { fetchMusicPlaylist } from './music-handler';

describe('fetchMusicPlaylist', () => {
  it('保留接口提供的实际时长，支持试听版本过滤', async () => {
    const result = await fetchMusicPlaylist(async () => new Response(JSON.stringify([{
      id: 11,
      name: '完整歌曲',
      artist: '歌手 A',
      duration: '4:21',
      url: 'https://cdn.example.com/track.mp3',
    }, {
      id: 12,
      name: '试听片段',
      artist: '歌手 B',
      duration: 20,
      url: 'https://cdn.example.com/preview.mp3',
    }])), {
      playlistId: '2794581085',
      primaryUrl: 'https://primary.example.com/meting/',
      fallbackUrl: 'https://fallback.example.com/meting/api',
    });

    expect(result.tracks.map((track) => track.durationSeconds)).toEqual([261, 20]);
  });

  it('规范化歌单并过滤没有音频地址的歌曲', async () => {
    const result = await fetchMusicPlaylist(async () => new Response(JSON.stringify([
      {
        id: 11,
        name: '第一首',
        artist: '歌手 A',
        pic: 'https://cdn.example.com/cover.jpg',
        url: 'https://cdn.example.com/track.mp3',
      },
      { id: 12, name: '受限歌曲', artist: '歌手 B', pic: '', url: '' },
    ])), {
      playlistId: '2794581085',
      primaryUrl: 'https://primary.example.com/meting/',
      fallbackUrl: 'https://fallback.example.com/meting/api',
    });

    expect(result).toEqual({
      playlistId: '2794581085',
      tracks: [{
        id: '11',
        title: '第一首',
        artist: '歌手 A',
        cover: 'https://cdn.example.com/cover.jpg',
        audioUrl: 'https://cdn.example.com/track.mp3',
      }],
    });
  });
});
