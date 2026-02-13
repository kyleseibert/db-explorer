import type { DatabaseSchema } from '../types';

export const musicLibrarySchema: DatabaseSchema = {
  tables: [
    {
      id: 'artists',
      name: 'Artists',
      position: { x: 0, y: 200 },
      columns: [
        { id: 'artist_id', name: 'artist_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
        { id: 'name', name: 'name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        { id: 'genre', name: 'genre', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        { id: 'country', name: 'country', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      ],
      rows: [
        { id: 'artist-1', cells: { artist_id: 1, name: 'Taylor Swift', genre: 'Pop', country: 'USA' } },
        { id: 'artist-2', cells: { artist_id: 2, name: 'Radiohead', genre: 'Alternative', country: 'UK' } },
        { id: 'artist-3', cells: { artist_id: 3, name: 'Kendrick Lamar', genre: 'Hip-Hop', country: 'USA' } },
        { id: 'artist-4', cells: { artist_id: 4, name: 'Adele', genre: 'Pop', country: 'UK' } },
        { id: 'artist-5', cells: { artist_id: 5, name: 'Daft Punk', genre: 'Electronic', country: 'France' } },
      ],
    },
    {
      id: 'albums',
      name: 'Albums',
      position: { x: 350, y: 200 },
      columns: [
        { id: 'album_id', name: 'album_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
        { id: 'title', name: 'title', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        { id: 'release_year', name: 'release_year', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        { id: 'artist_id', name: 'artist_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, foreignKeyRef: { tableId: 'artists', columnId: 'artist_id' }, isNullable: false },
      ],
      rows: [
        { id: 'album-1', cells: { album_id: 1, title: '1989', release_year: 2014, artist_id: 1 } },
        { id: 'album-2', cells: { album_id: 2, title: 'OK Computer', release_year: 1997, artist_id: 2 } },
        { id: 'album-3', cells: { album_id: 3, title: 'DAMN.', release_year: 2017, artist_id: 3 } },
        { id: 'album-4', cells: { album_id: 4, title: '25', release_year: 2015, artist_id: 4 } },
        { id: 'album-5', cells: { album_id: 5, title: 'Random Access Memories', release_year: 2013, artist_id: 5 } },
        { id: 'album-6', cells: { album_id: 6, title: 'Midnights', release_year: 2022, artist_id: 1 } },
        { id: 'album-7', cells: { album_id: 7, title: 'Kid A', release_year: 2000, artist_id: 2 } },
        { id: 'album-8', cells: { album_id: 8, title: '21', release_year: 2011, artist_id: 4 } },
      ],
    },
    {
      id: 'songs',
      name: 'Songs',
      position: { x: 700, y: 200 },
      columns: [
        { id: 'song_id', name: 'song_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
        { id: 'title', name: 'title', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        { id: 'duration_seconds', name: 'duration_seconds', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        { id: 'track_number', name: 'track_number', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false },
        { id: 'album_id', name: 'album_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, foreignKeyRef: { tableId: 'albums', columnId: 'album_id' }, isNullable: false },
      ],
      rows: [
        // 1989 (album 1)
        { id: 'song-1', cells: { song_id: 1, title: 'Shake It Off', duration_seconds: 219, track_number: 6, album_id: 1 } },
        { id: 'song-2', cells: { song_id: 2, title: 'Blank Space', duration_seconds: 231, track_number: 2, album_id: 1 } },
        // OK Computer (album 2)
        { id: 'song-3', cells: { song_id: 3, title: 'Paranoid Android', duration_seconds: 386, track_number: 2, album_id: 2 } },
        { id: 'song-4', cells: { song_id: 4, title: 'Karma Police', duration_seconds: 264, track_number: 6, album_id: 2 } },
        // DAMN. (album 3)
        { id: 'song-5', cells: { song_id: 5, title: 'HUMBLE.', duration_seconds: 177, track_number: 8, album_id: 3 } },
        { id: 'song-6', cells: { song_id: 6, title: 'DNA.', duration_seconds: 185, track_number: 2, album_id: 3 } },
        // 25 (album 4)
        { id: 'song-7', cells: { song_id: 7, title: 'Hello', duration_seconds: 295, track_number: 1, album_id: 4 } },
        { id: 'song-8', cells: { song_id: 8, title: 'When We Were Young', duration_seconds: 290, track_number: 3, album_id: 4 } },
        // Random Access Memories (album 5)
        { id: 'song-9', cells: { song_id: 9, title: 'Get Lucky', duration_seconds: 369, track_number: 8, album_id: 5 } },
        { id: 'song-10', cells: { song_id: 10, title: 'Instant Crush', duration_seconds: 337, track_number: 5, album_id: 5 } },
        // Midnights (album 6)
        { id: 'song-11', cells: { song_id: 11, title: 'Anti-Hero', duration_seconds: 200, track_number: 3, album_id: 6 } },
        { id: 'song-12', cells: { song_id: 12, title: 'Lavender Haze', duration_seconds: 202, track_number: 1, album_id: 6 } },
        // Kid A (album 7)
        { id: 'song-13', cells: { song_id: 13, title: 'Everything in Its Right Place', duration_seconds: 250, track_number: 1, album_id: 7 } },
        // 21 (album 8)
        { id: 'song-14', cells: { song_id: 14, title: 'Rolling in the Deep', duration_seconds: 228, track_number: 1, album_id: 8 } },
        { id: 'song-15', cells: { song_id: 15, title: 'Someone Like You', duration_seconds: 285, track_number: 4, album_id: 8 } },
      ],
    },
  ],
  relationships: [
    {
      id: 'rel-artist-album',
      sourceTableId: 'albums',
      sourceColumnId: 'artist_id',
      targetTableId: 'artists',
      targetColumnId: 'artist_id',
      type: '1:N',
    },
    {
      id: 'rel-album-song',
      sourceTableId: 'songs',
      sourceColumnId: 'album_id',
      targetTableId: 'albums',
      targetColumnId: 'album_id',
      type: '1:N',
    },
  ],
};
