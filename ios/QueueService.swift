// QueueService.swift
// Management for both catalog and library items.

import Foundation
import MusicKit

@available(iOS 15.0, *)
final class QueueService {

  // MARK: - Dependencies

  private let playbackController: PlaybackController
  private let catalogService: CatalogService

  /// Creates LibraryService on-demand (iOS 16+ only)
  @available(iOS 16.0, *)
  private func makeLibraryService() -> LibraryService {
    LibraryService()
  }

  // MARK: - Initialization

  init(
    playbackController: PlaybackController = .shared,
    catalogService: CatalogService = CatalogService()
  ) {
    self.playbackController = playbackController
    self.catalogService = catalogService
  }

  // MARK: - Queue Setup

  enum MediaType: String {
    case song
    case album
    case playlist
    case station
  }

  func setQueue(itemId: String, type: String) async throws {
    let musicItemId = MusicItemID(itemId)
    let isLibrary = Self.isLibraryId(itemId)

    guard let mediaType = MediaType(rawValue: type) else {
      throw QueueServiceError.unknownMediaType(type)
    }

    if isLibrary {
      guard #available(iOS 16.0, *) else {
        throw QueueServiceError.libraryRequiresiOS16
      }
      try await setLibraryQueue(id: musicItemId, type: mediaType)
    } else {
      try await setCatalogQueue(id: musicItemId, type: mediaType)
    }
  }

  // MARK: - Catalog Queue

  private func setCatalogQueue(id: MusicItemID, type: MediaType) async throws {
    switch type {
    case .song:
      guard let song = try await catalogService.fetchSong(id: id) else {
        throw QueueServiceError.itemNotFound("Song", inLibrary: false)
      }
      try await playbackController.setQueue(song)

    case .album:
      guard let album = try await catalogService.fetchAlbum(id: id) else {
        throw QueueServiceError.itemNotFound("Album", inLibrary: false)
      }
      try await playbackController.setQueue(album)

    case .playlist:
      guard let playlist = try await catalogService.fetchPlaylist(id: id) else {
        throw QueueServiceError.itemNotFound("Playlist", inLibrary: false)
      }
      try await playbackController.setQueue(playlist)

    case .station:
      guard let station = try await catalogService.fetchStation(id: id) else {
        throw QueueServiceError.itemNotFound("Station", inLibrary: false)
      }
      try await playbackController.setQueue(station)
    }
  }

  // MARK: - Library Queue

  @available(iOS 16.0, *)
  private func setLibraryQueue(id: MusicItemID, type: MediaType) async throws {
    let service = makeLibraryService()

    switch type {
    case .song:
      guard let song = try await service.fetchSong(id: id) else {
        throw QueueServiceError.itemNotFound("Song", inLibrary: true)
      }
      try await playbackController.setQueue(song)

    case .album:
      guard let album = try await service.fetchAlbum(id: id) else {
        throw QueueServiceError.itemNotFound("Album", inLibrary: true)
      }
      try await playbackController.setQueue(album)

    case .playlist:
      guard let playlist = try await service.fetchPlaylist(id: id) else {
        throw QueueServiceError.itemNotFound("Playlist", inLibrary: true)
      }
      try await playbackController.setQueue(playlist)

    case .station:
      // Stations are typically not in the library
      throw QueueServiceError.unsupportedLibraryType("station")
    }
  }

  // MARK: - Library Playback with Starting Position

  @available(iOS 16.0, *)
  func playLibrarySong(songId: String) async throws {
    let service = makeLibraryService()
    let id = MusicItemID(songId)
    guard let song = try await service.fetchSong(id: id) else {
      throw QueueServiceError.itemNotFound("Song", inLibrary: true)
    }
    try await playbackController.setQueue(song)
  }

  @available(iOS 16.0, *)
  func playLibraryPlaylist(playlistId: String, startingAt index: Int) async throws {
    let service = makeLibraryService()
    let id = MusicItemID(playlistId)
    guard let playlist = try await service.fetchPlaylist(id: id) else {
      throw QueueServiceError.itemNotFound("Playlist", inLibrary: true)
    }

    let songs = try await service.extractSongs(from: playlist)
    guard !songs.isEmpty else {
      throw LibraryServiceError.noSongsInPlaylist
    }

    let startIndex = (index >= 0 && index < songs.count) ? index : 0
    try await playbackController.setQueue(songs, startingAt: songs[startIndex])
  }

  // MARK: - Helpers

  /// Checks if an ID is a library ID (starts with "l.", "i.", or "p.")
  static func isLibraryId(_ itemId: String) -> Bool {
    itemId.hasPrefix("l.") || itemId.hasPrefix("i.") || itemId.hasPrefix("p.")
  }
}

// MARK: - Errors

enum QueueServiceError: LocalizedError {
  case unknownMediaType(String)
  case libraryRequiresiOS16
  case itemNotFound(String, inLibrary: Bool)
  case unsupportedLibraryType(String)

  var errorDescription: String? {
    switch self {
    case .unknownMediaType(let type):
      return "Unknown media type: \(type)"
    case .libraryRequiresiOS16:
      return "Library playback requires iOS 16.0 or later"
    case .itemNotFound(let item, let inLibrary):
      let source = inLibrary ? "library" : "catalog"
      return "\(item) not found in \(source)"
    case .unsupportedLibraryType(let type):
      return "Unsupported library media type: \(type)"
    }
  }
}
