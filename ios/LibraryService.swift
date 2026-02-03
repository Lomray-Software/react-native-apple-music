// LibraryService.swift
// Handles user's Apple Music library operations.

import Foundation
import MusicKit

@available(iOS 16.0, *)
final class LibraryService {

  // MARK: - Options

  struct PaginationOptions {
    let limit: Int
    let offset: Int

    init(from dictionary: NSDictionary) {
      limit = dictionary["limit"] as? Int ?? 25
      offset = dictionary["offset"] as? Int ?? 0
    }
  }

  // MARK: - Recently Played

  func getRecentlyPlayed() async throws -> [[String: Any]] {
    let request = MusicRecentlyPlayedContainerRequest()
    let response = try await request.response()
    return response.items.map(MusicItemMapper.map)
  }

  // MARK: - Playlists

  func getPlaylists(options: PaginationOptions) async throws -> [[String: Any]] {
    var request = MusicLibraryRequest<Playlist>()
    request.limit = options.limit
    request.offset = options.offset

    let response = try await request.response()

    // Load tracks for accurate count
    var playlists: [[String: Any]] = []
    for playlist in response.items {
      let detailed = try await playlist.with([.tracks])
      playlists.append(MusicItemMapper.map(detailed))
    }
    return playlists
  }

  func getPlaylistSongs(playlistId: String) async throws -> [[String: Any]] {
    let musicItemId = MusicItemID(playlistId)

    var request = MusicLibraryRequest<Playlist>()
    request.filter(matching: \.id, equalTo: musicItemId)

    let response = try await request.response()
    guard let playlist = response.items.first else {
      throw LibraryServiceError.playlistNotFound
    }

    let detailed = try await playlist.with([.tracks])
    var songs: [[String: Any]] = []

    if let tracks = detailed.tracks {
      for track in tracks {
        if case .song(let song) = track {
          songs.append(MusicItemMapper.map(song))
        }
      }
    }
    return songs
  }

  // MARK: - Songs

  func getSongs(options: PaginationOptions) async throws -> [[String: Any]] {
    var request = MusicLibraryRequest<Song>()
    request.limit = options.limit
    request.offset = options.offset

    let response = try await request.response()
    return response.items.map(MusicItemMapper.map)
  }

  // MARK: - Fetch Items by ID

  func fetchSong(id: MusicItemID) async throws -> Song? {
    var request = MusicLibraryRequest<Song>()
    request.filter(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchAlbum(id: MusicItemID) async throws -> Album? {
    var request = MusicLibraryRequest<Album>()
    request.filter(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchPlaylist(id: MusicItemID) async throws -> Playlist? {
    var request = MusicLibraryRequest<Playlist>()
    request.filter(matching: \.id, equalTo: id)
    let response = try await request.response()
    guard let playlist = response.items.first else { return nil }
    return try await playlist.with([.tracks])
  }

  // MARK: - Extract Songs from Playlist

  func extractSongs(from playlist: Playlist) async throws -> [Song] {
    let detailed = try await playlist.with([.tracks])
    guard let tracks = detailed.tracks else { return [] }

    var songs: [Song] = []
    for track in tracks {
      if case .song(let song) = track {
        songs.append(song)
      }
    }
    return songs
  }
}

// MARK: - Errors

enum LibraryServiceError: LocalizedError {
  case playlistNotFound
  case songNotFound
  case albumNotFound
  case noTracksInPlaylist
  case noSongsInPlaylist

  var errorDescription: String? {
    switch self {
    case .playlistNotFound: return "Playlist not found in library"
    case .songNotFound: return "Song not found in library"
    case .albumNotFound: return "Album not found in library"
    case .noTracksInPlaylist: return "No tracks in playlist"
    case .noSongsInPlaylist: return "No songs in playlist"
    }
  }
}
