export interface MusicTrack {
  id?: string;
  title: string;
  artist: string;
  cover?: string;
  audioUrl: string;
  durationSeconds?: number;
}

export interface MusicPlaylist {
  playlistId: string;
  tracks: MusicTrack[];
}

export interface MusicPlaylistConfig {
  playlistId: string;
  primaryUrl: string;
  fallbackUrl: string;
}

export type MusicFetcher = (input: string, init?: RequestInit) => Promise<Response>;

interface RawMusicTrack {
  id?: string | number;
  songid?: string | number;
  title?: unknown;
  name?: unknown;
  artist?: unknown;
  author?: unknown;
  cover?: unknown;
  pic?: unknown;
  duration?: unknown;
  durationms?: unknown;
  audioUrl?: unknown;
  url?: unknown;
}

const isHttpUrl = (value: unknown): value is string => (
  typeof value === 'string' && /^https?:\/\/\S+$/i.test(value)
);

function parseDurationSeconds(value: unknown, milliseconds = false): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    const seconds = milliseconds || value > 1_000 ? value / 1_000 : value;
    return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
  }

  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parts = trimmed.split(':').map(Number);
  if (parts.length >= 2 && parts.every((part) => Number.isFinite(part) && part >= 0)) {
    const seconds = parts.reduce((total, part) => total * 60 + part, 0);
    return seconds > 0 ? seconds : undefined;
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric) || numeric <= 0) return undefined;
  const seconds = milliseconds || numeric > 1_000 ? numeric / 1_000 : numeric;
  return seconds > 0 ? seconds : undefined;
}

function toRawTracks(value: unknown): RawMusicTrack[] {
  if (Array.isArray(value)) return value.filter((track): track is RawMusicTrack => typeof track === 'object' && track !== null);
  if (typeof value !== 'object' || value === null) return [];

  const container = value as { data?: unknown; result?: unknown; songs?: unknown };
  for (const candidate of [container.data, container.result, container.songs]) {
    if (Array.isArray(candidate)) return toRawTracks(candidate);
  }
  return [];
}

export function normalizeMusicTracks(value: unknown): MusicTrack[] {
  return toRawTracks(value).flatMap((track) => {
    const title = typeof track.title === 'string' ? track.title : track.name;
    const artist = typeof track.artist === 'string' ? track.artist : track.author;
    const audioUrl = isHttpUrl(track.audioUrl) ? track.audioUrl : track.url;
    if (typeof title !== 'string' || typeof artist !== 'string' || !isHttpUrl(audioUrl)) return [];

    const id = track.id ?? track.songid;
    const cover = isHttpUrl(track.cover) ? track.cover : track.pic;
    const durationSeconds = parseDurationSeconds(track.duration)
      ?? parseDurationSeconds(track.durationms, true);
    return [{
      ...(id !== undefined ? { id: String(id) } : {}),
      title: title.trim(),
      artist: artist.trim(),
      ...(isHttpUrl(cover) ? { cover } : {}),
      audioUrl,
      ...(durationSeconds !== undefined ? { durationSeconds } : {}),
    } satisfies MusicTrack];
  }).filter((track) => track.title.length > 0 && track.artist.length > 0);
}

function buildPlaylistUrl(endpoint: string, playlistId: string): string {
  const url = new URL(endpoint);
  url.searchParams.set('type', 'playlist');
  url.searchParams.set('id', playlistId);
  return url.toString();
}

export async function fetchMusicPlaylist(
  fetcher: MusicFetcher,
  config: MusicPlaylistConfig,
): Promise<MusicPlaylist> {
  const endpoints = [...new Set([config.primaryUrl, config.fallbackUrl])];

  for (const endpoint of endpoints) {
    try {
      const response = await fetcher(buildPlaylistUrl(endpoint, config.playlistId), {
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) continue;
      const tracks = normalizeMusicTracks(await response.json());
      if (tracks.length > 0) return { playlistId: config.playlistId, tracks };
    } catch {
      // Try the configured fallback without exposing upstream failures to clients.
    }
  }

  return { playlistId: config.playlistId, tracks: [] };
}
