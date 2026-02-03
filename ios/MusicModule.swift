// MusicModule.swift
// React Native bridge adapter for Apple Music.
// Thin layer that delegates to specialized services.

import Foundation
import MusicKit
import React

@available(iOS 15.0, *)
@objc(MusicModule)
final class MusicModule: RCTEventEmitter {

  // MARK: - Services

  private let playbackController = PlaybackController.shared
  private let subscriptionService = SubscriptionService()
  private let catalogService = CatalogService()
  private let queueService: QueueService

  /// Creates LibraryService on-demand (iOS 16+ only)
  @available(iOS 16.0, *)
  private func makeLibraryService() -> LibraryService {
    LibraryService()
  }

  // MARK: - Observation

  private var playbackObserver: PlaybackObserver?

  // MARK: - Initialization

  override init() {
    queueService = QueueService(
      playbackController: PlaybackController.shared,
      catalogService: CatalogService()
    )
    super.init()
  }

  deinit {
    playbackObserver?.stopObserving()
  }

  // MARK: - RCTEventEmitter Overrides

  override func supportedEvents() -> [String]! {
    ["onPlaybackStateChange", "onCurrentSongChange", "onPlaybackTimeUpdate"]
  }

  override func startObserving() {
    let observer = PlaybackObserver(playbackController: playbackController)
    observer.delegate = self
    observer.startObserving()
    playbackObserver = observer
  }

  override func stopObserving() {
    playbackObserver?.stopObserving()
    playbackObserver = nil
  }

  @objc
  static override func requiresMainQueueSetup() -> Bool {
    false
  }

  // MARK: - Player Configuration

  @objc(configurePlayer:resolver:rejecter:)
  func configurePlayer(
    _ mixWithOthers: Bool,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      try playbackController.configureAudioSession(mixWithOthers: mixWithOthers)
      resolve(["mixWithOthers": mixWithOthers])
    } catch {
      reject("ERROR", "Failed to configure audio session: \(error)", error)
    }
  }

  // MARK: - Playback State

  @objc(getCurrentState:rejecter:)
  func getCurrentState(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Use Task.detached to avoid inheriting main thread context from RN
    Task.detached { [playbackController] in
      let state = playbackController.state
      let songInfo = await playbackController.fetchCurrentSongInfo()

      var result: [String: Any] = [
        "playbackRate": state.playbackRate,
        "playbackStatus": MusicItemMapper.describePlaybackStatus(
          state.playbackStatus
        ),
        "playbackTime": playbackController.playbackTime,
      ]
      if let songInfo = songInfo {
        result["currentSong"] = songInfo
      }
      resolve(result)
    }
  }

  // MARK: - Playback Controls

  @objc(play)
  func play() {
    Task {
      do {
        try await playbackController.play()
      } catch {
        print("[MusicModule] Play failed: \(error)")
      }
    }
  }

  @objc(pause)
  func pause() {
    playbackController.pause()
  }

  @objc(togglePlayerState)
  func togglePlayerState() {
    Task {
      do {
        try await playbackController.togglePlayback()
      } catch {
        print("[MusicModule] Toggle playback failed: \(error)")
      }
    }
  }

  @objc(skipToNextEntry)
  func skipToNextEntry() {
    Task {
      do {
        try await playbackController.skipToNext()
      } catch {
        print("[MusicModule] Skip to next failed: \(error)")
      }
    }
  }

  @objc(skipToPreviousEntry)
  func skipToPreviousEntry() {
    Task {
      do {
        try await playbackController.skipToPrevious()
      } catch {
        print("[MusicModule] Skip to previous failed: \(error)")
      }
    }
  }

  @objc(restartCurrentEntry)
  func restartCurrentEntry() {
    playbackController.restartCurrentEntry()
  }

  @objc(seekToTime:)
  func seekToTime(_ time: Double) {
    playbackController.seek(to: time)
  }

  // MARK: - Authorization

  @objc(authorization:)
  func authorization(_ callback: @escaping RCTResponseSenderBlock) {
    Task {
      let status = await subscriptionService.requestAuthorization()
      callback([status.rawValue])
    }
  }

  // MARK: - Subscription

  @objc(checkSubscription:rejecter:)
  func checkSubscription(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task.detached { [subscriptionService] in
      do {
        let details = try await subscriptionService.checkSubscription()
        resolve(details.toDictionary())
      } catch {
        if let subError = SubscriptionService.wrapSubscriptionError(error) {
          reject(subError.code, subError.message, subError.toNSError())
        } else {
          reject("ERROR", error.localizedDescription, error as NSError)
        }
      }
    }
  }

  // MARK: - Catalog Search

  @objc(catalogSearch:types:options:resolver:rejecter:)
  func catalogSearch(
    _ term: String,
    types: [String],
    options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Capture options parsing on current thread, then detach for network
    let searchOptions = CatalogService.SearchOptions(from: options)
    Task.detached { [catalogService] in
      do {
        let result = try await catalogService.search(
          term: term,
          types: types,
          options: searchOptions
        )
        resolve(["songs": result.songs, "albums": result.albums])
      } catch {
        reject("ERROR", "Failed to perform catalog search: \(error)", error)
      }
    }
  }

  // MARK: - Queue Management

  @objc(setPlaybackQueue:type:resolver:rejecter:)
  func setPlaybackQueue(
    _ itemId: String,
    type: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task.detached { [queueService] in
      do {
        try await queueService.setQueue(itemId: itemId, type: type)
        resolve("Track(s) added to queue")
      } catch {
        reject("ERROR", error.localizedDescription, error as NSError)
      }
    }
  }

  // MARK: - Library Access (iOS 16+)

  @available(iOS 16.0, *)
  @objc(getTracksFromLibrary:rejecter:)
  func getTracksFromLibrary(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let service = makeLibraryService()
    Task.detached {
      do {
        let tracks = try await service.getRecentlyPlayed()
        resolve(["recentlyPlayedItems": tracks])
      } catch {
        reject("ERROR", "Failed to get recently played tracks: \(error)", error)
      }
    }
  }

  @available(iOS 16.0, *)
  @objc(getUserPlaylists:resolver:rejecter:)
  func getUserPlaylists(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let service = makeLibraryService()
    let paginationOptions = LibraryService.PaginationOptions(from: options)

    Task.detached {
      do {
        let playlists = try await service.getPlaylists(
          options: paginationOptions
        )
        resolve(["playlists": playlists])
      } catch {
        reject("ERROR", "Failed to get user playlists: \(error)", error)
      }
    }
  }

  @available(iOS 16.0, *)
  @objc(getLibrarySongs:resolver:rejecter:)
  func getLibrarySongs(
    _ options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let service = makeLibraryService()
    let paginationOptions = LibraryService.PaginationOptions(from: options)
    Task.detached {
      do {
        let songs = try await service.getSongs(options: paginationOptions)
        resolve(["songs": songs])
      } catch {
        reject("ERROR", "Failed to get library songs: \(error)", error)
      }
    }
  }

  @available(iOS 16.0, *)
  @objc(getPlaylistSongs:options:resolver:rejecter:)
  func getPlaylistSongs(
    _ playlistId: String,
    options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let service = makeLibraryService()
    Task.detached {
      do {
        let songs = try await service.getPlaylistSongs(playlistId: playlistId)
        resolve(["songs": songs])
      } catch {
        reject("ERROR", "Failed to get playlist songs: \(error)", error)
      }
    }
  }

  @available(iOS 16.0, *)
  @objc(playLibrarySong:resolver:rejecter:)
  func playLibrarySong(
    _ songId: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task.detached { [queueService] in
      do {
        try await queueService.playLibrarySong(songId: songId)
        resolve("Library song added to queue")
      } catch {
        reject("ERROR", error.localizedDescription, error as NSError)
      }
    }
  }

  @available(iOS 16.0, *)
  @objc(playLibraryPlaylist:startingAt:resolver:rejecter:)
  func playLibraryPlaylist(
    _ playlistId: String,
    startingAt songIndex: Int,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task.detached { [queueService] in
      do {
        try await queueService.playLibraryPlaylist(
          playlistId: playlistId,
          startingAt: songIndex
        )
        resolve("Library playlist added to queue")
      } catch {
        reject("ERROR", error.localizedDescription, error as NSError)
      }
    }
  }
}

// MARK: - PlaybackObserverDelegate

@available(iOS 15.0, *)
extension MusicModule: PlaybackObserverDelegate {

  @MainActor
  func playbackStateDidChange(_ state: PlaybackObserver.PlaybackInfo) {
    var body: [String: Any] = [
      "playbackRate": state.playbackRate,
      "playbackStatus": state.playbackStatus,
      "playbackTime": state.playbackTime,
    ]
    if let song = state.currentSong {
      body["currentSong"] = song
    }
    sendEvent(withName: "onPlaybackStateChange", body: body)
  }

  @MainActor
  func currentSongDidChange(_ songInfo: [String: Any]?) {
    guard let songInfo = songInfo else { return }
    sendEvent(withName: "onCurrentSongChange", body: ["currentSong": songInfo])
  }

  @MainActor
  func playbackTimeDidUpdate(_ time: TimeInterval) {
    sendEvent(withName: "onPlaybackTimeUpdate", body: ["playbackTime": time])
  }
}
