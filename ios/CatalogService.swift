// CatalogService.swift
// Handles Apple Music catalog search and item fetching.

import Foundation
import MusicKit

@available(iOS 15.0, *)
final class CatalogService {

  // MARK: - Search

  struct SearchOptions {
    let limit: Int
    let offset: Int

    init(from dictionary: NSDictionary) {
      limit = dictionary["limit"] as? Int ?? 25
      offset = dictionary["offset"] as? Int ?? 0
    }
  }

  struct SearchResult {
    let songs: [[String: Any]]
    let albums: [[String: Any]]
  }

  func search(term: String, types: [String], options: SearchOptions) async throws -> SearchResult {
    let searchTypes = types.compactMap { typeString -> MusicCatalogSearchable.Type? in
      switch typeString {
      case "songs": return Song.self
      case "albums": return Album.self
      default: return nil
      }
    }

    var request = MusicCatalogSearchRequest(term: term, types: searchTypes)
    request.limit = options.limit
    request.offset = options.offset

    let response = try await request.response()

    return SearchResult(
      songs: response.songs.map(MusicItemMapper.map),
      albums: response.albums.map(MusicItemMapper.map)
    )
  }

  // MARK: - Fetch Single Items

  func fetchSong(id: MusicItemID) async throws -> Song? {
    let request = MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchAlbum(id: MusicItemID) async throws -> Album? {
    let request = MusicCatalogResourceRequest<Album>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchPlaylist(id: MusicItemID) async throws -> Playlist? {
    let request = MusicCatalogResourceRequest<Playlist>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }

  func fetchStation(id: MusicItemID) async throws -> Station? {
    let request = MusicCatalogResourceRequest<Station>(matching: \.id, equalTo: id)
    let response = try await request.response()
    return response.items.first
  }
}
