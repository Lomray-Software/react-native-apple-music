// MusicItemMapper.swift

import Foundation
import MusicKit

@available(iOS 15.0, *)
enum MusicItemMapper {

  // MARK: - Song

  static func map(_ song: Song) -> [String: Any] {
    [
      "id": String(describing: song.id),
      "title": song.title,
      "artistName": song.artistName,
      "artworkUrl": extractArtworkURL(song.artwork),
      "duration": String(song.duration ?? 0),
    ]
  }

  // MARK: - Album

  static func map(_ album: Album) -> [String: Any] {
    [
      "id": String(describing: album.id),
      "title": album.title,
      "artistName": album.artistName,
      "artworkUrl": extractArtworkURL(album.artwork),
      "trackCount": String(album.trackCount),
    ]
  }

  // MARK: - Playlist

  static func map(_ playlist: Playlist) -> [String: Any] {
    [
      "id": String(describing: playlist.id),
      "name": playlist.name,
      "description": playlist.standardDescription ?? "",
      "artworkUrl": extractArtworkURL(playlist.artwork),
      "trackCount": playlist.tracks?.count ?? 0,
    ]
  }

  // MARK: - Music Video (iOS 16+)

  @available(iOS 16.0, *)
  static func map(_ musicVideo: MusicVideo) -> [String: Any] {
    [
      "id": String(describing: musicVideo.id),
      "title": musicVideo.title,
      "artistName": musicVideo.artistName,
      "artworkUrl": extractArtworkURL(musicVideo.artwork),
      "duration": musicVideo.duration ?? 0,
    ]
  }

  // MARK: - Recently Played Items (iOS 16+)

  @available(iOS 16.0, *)
  static func map(_ item: RecentlyPlayedMusicItem) -> [String: Any] {
    var result: [String: Any] = [
      "id": String(describing: item.id),
      "title": item.title,
      "subtitle": String(describing: item.subtitle ?? ""),
    ]

    switch item {
    case .album:
      result["type"] = "album"
    case .playlist:
      result["type"] = "playlist"
    case .station:
      result["type"] = "station"
    default:
      result["type"] = "unknown"
    }

    return result
  }

  // MARK: - Playback Status

  static func describePlaybackStatus(_ status: MusicPlayer.PlaybackStatus) -> String {
    switch status {
    case .playing: return "playing"
    case .paused: return "paused"
    case .stopped: return "stopped"
    case .interrupted: return "interrupted"
    case .seekingForward: return "seekingForward"
    case .seekingBackward: return "seekingBackward"
    @unknown default: return "unknown"
    }
  }

  // MARK: - Private Helpers

  private static func extractArtworkURL(_ artwork: Artwork?, width: Int = 200, height: Int = 200) -> String {
    guard let artwork = artwork,
          let url = artwork.url(width: width, height: height),
          url.scheme == "https" || url.scheme == "http"
    else {
      return ""
    }
    return url.absoluteString
  }
}
