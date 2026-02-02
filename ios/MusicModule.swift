import AVFoundation
import Combine
import Foundation
import MusicKit
import React
import StoreKit

@available(iOS 15.0, *)
@objc(MusicModule)
class MusicModule: RCTEventEmitter {

  // MARK: - Properties

  private var queueObservation: AnyCancellable?
  private var stateObservation: AnyCancellable?
  private var lastReportedPlaybackStatus: MusicKit.MusicPlayer.PlaybackStatus?

  // Use ApplicationMusicPlayer for mixing with other audio sources
  private var player: ApplicationMusicPlayer {
    return ApplicationMusicPlayer.shared
  }

  // MARK: - Initialization

  override init() {
    super.init()
  }

  deinit {
    stateObservation?.cancel()
    queueObservation?.cancel()
  }

  override func supportedEvents() -> [String]! {
    return ["onPlaybackStateChange", "onCurrentSongChange"]
  }

  override func startObserving() {
    startObservingPlaybackState()
    startObservingQueueChanges()
  }

  override func stopObserving() {
    stateObservation?.cancel()
    queueObservation?.cancel()
    stateObservation = nil
    queueObservation = nil
  }

  @objc
  static override func requiresMainQueueSetup() -> Bool {
    return false
  }

  // MARK: - Player Configuration

  @objc(configurePlayer:resolver:rejecter:)
  func configurePlayer(
    _ mixWithOthers: Bool,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let audioSession = AVAudioSession.sharedInstance()
      if mixWithOthers {
        try audioSession.setCategory(
          .playback,
          mode: .default,
          options: [.mixWithOthers, .duckOthers]
        )
      } else {
        try audioSession.setCategory(.playback, mode: .default)
      }
      try audioSession.setActive(true)

      resolve(["mixWithOthers": mixWithOthers])
    } catch {
      reject("ERROR", "Failed to configure audio session: \(error)", error)
    }
  }

  // MARK: - Observers

  private func startObservingPlaybackState() {
    stateObservation = player.state.objectWillChange.sink { [weak self] _ in
      self?.sendPlaybackStateUpdate()
    }
  }

  private func startObservingQueueChanges() {
    queueObservation = player.queue.objectWillChange.sink { [weak self] _ in
      self?.sendCurrentSongUpdate()
    }
  }

  private func sendCurrentSongUpdate() {
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
      guard let self = self else { return }
      self.getCurrentSongInfo { songInfo in
        if let songInfo = songInfo {
          self.sendEvent(
            withName: "onCurrentSongChange",
            body: ["currentSong": songInfo]
          )
        }
      }
    }
  }

  private func sendPlaybackStateUpdate() {
    let state = player.state
    let playbackTime = player.playbackTime
    let playbackStatusDescription = describePlaybackStatus(state.playbackStatus)
    let playbackRate = state.playbackRate

    if lastReportedPlaybackStatus != state.playbackStatus {
      self.getCurrentSongInfo { [weak self] songInfo in
        guard let self = self else { return }
        var playbackInfo: [String: Any] = [
          "playbackRate": playbackRate,
          "playbackStatus": playbackStatusDescription,
          "playbackTime": playbackTime,
        ]
        if let songInfo = songInfo {
          playbackInfo["currentSong"] = songInfo
        }
        self.sendEvent(withName: "onPlaybackStateChange", body: playbackInfo)
      }
      lastReportedPlaybackStatus = state.playbackStatus
    }
  }

  @objc(getCurrentState:rejecter:)
  func getCurrentState(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let state = player.state
    let playbackTime = player.playbackTime
    let playbackStatusDescription = describePlaybackStatus(state.playbackStatus)
    let playbackRate = state.playbackRate

    self.getCurrentSongInfo { songInfo in
      var currentState: [String: Any] = [
        "playbackRate": playbackRate,
        "playbackStatus": playbackStatusDescription,
        "playbackTime": playbackTime,
      ]
      if let songInfo = songInfo {
        currentState["currentSong"] = songInfo
      }
      resolve(currentState)
    }
  }

  private func getCurrentSongInfo(
    completion: @escaping ([String: Any]?) -> Void
  ) {
    guard let currentEntry = player.queue.currentEntry else {
      print("No current entry in the playback queue")
      completion(nil)
      return
    }

    switch currentEntry.item {
    case .song(let song):
      Task {
        let songID = song.id
        let request = MusicCatalogResourceRequest<Song>(
          matching: \.id,
          equalTo: songID
        )
        do {
          let response = try await request.response()
          if let foundSong = response.items.first {
            let songInfo = self.convertSongToDictionary(foundSong)
            DispatchQueue.main.async {
              completion(songInfo)
            }
          } else {
            print("Song not found in the response.")
            DispatchQueue.main.async {
              completion(nil)
            }
          }
        } catch {
          print("Error requesting song: \(error)")
          DispatchQueue.main.async {
            completion(nil)
          }
        }
      }

    case .musicVideo(let musicVideo):
      Task {
        print("The current item is a music video: \(musicVideo.title)")

        let request = MusicCatalogResourceRequest<MusicVideo>(
          matching: \.id,
          equalTo: musicVideo.id
        )
        do {
          let response = try await request.response()
          if let foundMusicVideo = response.items.first {
            if #available(iOS 16.0, *) {
              let songInfo = self.convertMusicVideosToDictionary(
                foundMusicVideo
              )
              DispatchQueue.main.async {
                completion(songInfo)
              }
            } else {
              print("Update your IOS version to 16.0>")
              DispatchQueue.main.async {
                completion(nil)
              }
            }
          } else {
            print("Music video not found in the response.")
            DispatchQueue.main.async {
              completion(nil)
            }
          }
        } catch {
          print("Error requesting music video: \(error)")
          DispatchQueue.main.async {
            completion(nil)
          }
        }
      }

    case .some(let some):
      print("The current item is some item:\(some.id)")
      completion(nil)

    default:
      print("The current item is neither a song nor a music video")
      completion(nil)
    }
  }

  private func describePlaybackStatus(
    _ status: MusicKit.MusicPlayer.PlaybackStatus
  ) -> String {
    switch status {
    case .playing:
      return "playing"
    case .paused:
      return "paused"
    case .stopped:
      return "stopped"
    case .interrupted:
      return "interrupted"
    case .seekingForward:
      return "seekingForward"
    case .seekingBackward:
      return "seekingBackward"
    default:
      return "unknown"
    }
  }

  @objc(checkSubscription:rejecter:)
  func checkSubscription(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        let subscription = try await MusicSubscription.current
        let subscriptionDetails: [String: Any] = [
          "canPlayCatalogContent": subscription.canPlayCatalogContent,
          "canBecomeSubscriber": subscription.canBecomeSubscriber,
          "hasCloudLibraryEnabled": subscription.hasCloudLibraryEnabled,
          "isMusicCatalogSubscriptionEligible": subscription
            .canBecomeSubscriber,
        ]
        resolve(subscriptionDetails)
      } catch {
        if let subError = error as? MusicSubscription.Error {
          let code = subError.rawValue
          // Use Apple's direct localized message so the promise rejects with the exact text from Apple.
          let message = subError.localizedDescription
          var userInfo: [String: Any] = [
            NSLocalizedDescriptionKey: message
          ]
          if let reason = subError.failureReason {
            userInfo[NSLocalizedFailureReasonErrorKey] = reason
          }
          if let suggestion = subError.recoverySuggestion {
            userInfo[NSLocalizedRecoverySuggestionErrorKey] = suggestion
          }
          if let anchor = subError.helpAnchor {
            userInfo[NSHelpAnchorErrorKey] = anchor
          }
          let nsError = NSError(
            domain: "MusicSubscription",
            code: 0,
            userInfo: userInfo
          )
          reject(code, message, nsError)
        } else {
          reject("ERROR", error.localizedDescription, error as NSError)
        }
      }
    }
  }

  @objc(togglePlayerState)
  func togglePlayerState() {
    let playbackState = player.state.playbackStatus

    switch playbackState {
    case .playing:
      pause()
    case .paused, .stopped, .interrupted:
      play()
    default:
      play()
    }
  }

  @objc(play)
  func play() {
    Task {
      do {
        try await player.play()
      } catch {
        print("Play failed: \(error)")
      }
    }
  }

  @objc(pause)
  func pause() {
    player.pause()
  }

  @objc(skipToNextEntry)
  func skipToNextEntry() {
    Task {
      do {
        try await player.skipToNextEntry()
      } catch {
        print("Skip to next failed: \(error)")
      }
    }
  }

  @objc(skipToPreviousEntry)
  func skipToPreviousEntry() {
    Task {
      do {
        try await player.skipToPreviousEntry()
      } catch {
        print("Previous failed: \(error)")
      }
    }
  }

  @objc(restartCurrentEntry)
  func restartCurrentEntry() {
    player.restartCurrentEntry()
  }

  @objc(seekToTime:)
  func seekToTime(_ time: Double) {
    player.playbackTime = time
  }

  @objc(authorization:)
  func authorization(_ callback: @escaping RCTResponseSenderBlock) {
    SKCloudServiceController.requestAuthorization { (status) in
      switch status {
      case .authorized:
        callback(["authorized"])
      case .denied:
        callback(["denied"])
      case .notDetermined:
        callback(["notDetermined"])
      case .restricted:
        callback(["restricted"])
      @unknown default:
        callback(["unknown"])
      }
    }
  }

  func convertSongToDictionary(_ song: Song) -> [String: Any] {
    var artworkUrlString: String = ""

    if let artwork = song.artwork {
      if let artworkUrl = artwork.url(width: 200, height: 200) {

        // Only use http/https URLs - musicKit:// scheme is not loadable
        if artworkUrl.scheme == "https" || artworkUrl.scheme == "http" {
          artworkUrlString = artworkUrl.absoluteString
        }
      }
    }

    return [
      "id": String(describing: song.id),
      "title": song.title,
      "artistName": song.artistName,
      "artworkUrl": artworkUrlString,
      "duration": String(song.duration ?? 0),
    ]
  }

  func convertAlbumToDictionary(_ album: Album) -> [String: Any] {
    var artworkUrlString: String = ""

    if let artwork = album.artwork {
      if let artworkUrl = artwork.url(width: 200, height: 200) {
        if artworkUrl.scheme == "https" || artworkUrl.scheme == "http" {
          artworkUrlString = artworkUrl.absoluteString
        }
      }
    }

    return [
      "id": String(describing: album.id),
      "title": album.title,
      "artistName": album.artistName,
      "artworkUrl": artworkUrlString,
      "trackCount": String(album.trackCount),
    ]
  }

  @available(iOS 16.0, *)
  func convertMusicItemsToDictionary(_ track: RecentlyPlayedMusicItem)
    -> [String: Any]
  {
    var resultCollection: [String: Any] = [
      "id": String(describing: track.id),
      "title": track.title,
      "subtitle": String(describing: track.subtitle ?? ""),
    ]

    switch track {
    case .album:
      resultCollection["type"] = "album"
      break
    case .playlist:
      resultCollection["type"] = "playlist"
      break
    case .station:
      resultCollection["type"] = "station"
      break
    default:
      resultCollection["type"] = "unknown"
    }

    return resultCollection
  }

  @available(iOS 16.0, *)
  func convertMusicVideosToDictionary(_ musicVideo: MusicVideo) -> [String: Any]
  {
    var artworkUrlString: String = ""

    if let artwork = musicVideo.artwork {
      let artworkUrl = artwork.url(width: 200, height: 200)

      if let url = artworkUrl, url.scheme == "musicKit" {
        print(
          "Artwork URL is a MusicKit URL, may not be directly accessible: \(url)"
        )
      } else {
        artworkUrlString = artworkUrl?.absoluteString ?? ""
      }
    }

    return [
      "id": String(describing: musicVideo.id),
      "title": musicVideo.title,
      "artistName": musicVideo.artistName,
      "artworkUrl": artworkUrlString,
      "duration": musicVideo.duration!,
    ]
  }

  @objc(catalogSearch:types:options:resolver:rejecter:)
  func catalogSearch(
    _ term: String,
    types: [String],
    options: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      let searchTypes = types.compactMap {
        typeString -> MusicCatalogSearchable.Type? in
        switch typeString {
        case "songs":
          return Song.self
        case "albums":
          return Album.self
        default:
          return nil
        }
      }

      let limit = options["limit"] as? Int ?? 25
      let offset = options["offset"] as? Int ?? 0

      var request = MusicCatalogSearchRequest(term: term, types: searchTypes)
      request.limit = limit
      request.offset = offset

      do {
        let response = try await request.response()
        print("Response received: \(response)")

        let songs = response.songs.compactMap(convertSongToDictionary)
        let albums = response.albums.compactMap(convertAlbumToDictionary)

        resolve(["songs": songs, "albums": albums])
      } catch {
        reject("ERROR", "Failed to perform catalog search: \(error)", error)
      }
    }
  }

  @available(iOS 16.0, *)
  @objc(getTracksFromLibrary:rejecter:)
  func getTracksFromLibrary(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        let request = MusicRecentlyPlayedContainerRequest()
        let response = try await request.response()

        let tracks = response.items.compactMap(convertMusicItemsToDictionary)

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
    Task {
      do {
        var request = MusicLibraryRequest<Playlist>()

        let limit = options["limit"] as? Int ?? 25
        let offset = options["offset"] as? Int ?? 0

        request.limit = limit
        request.offset = offset

        let response = try await request.response()

        // Load tracks for each playlist to get accurate track count
        var playlists: [[String: Any]] = []
        for playlist in response.items {
          let detailedPlaylist = try await playlist.with([.tracks])
          playlists.append(convertPlaylistToDictionary(detailedPlaylist))
        }

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
    Task {
      do {
        var request = MusicLibraryRequest<Song>()

        let limit = options["limit"] as? Int ?? 25
        let offset = options["offset"] as? Int ?? 0

        request.limit = limit
        request.offset = offset

        let response = try await request.response()

        let songs = response.items.map { song -> [String: Any] in
          return convertSongToDictionary(song)
        }

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
    Task {
      do {
        let musicItemId = MusicItemID(playlistId)
        _ = MusicLibraryRequest<Playlist>.init()

        var filteredRequest = MusicLibraryRequest<Playlist>()
        filteredRequest.filter(matching: \.id, equalTo: musicItemId)

        let response = try await filteredRequest.response()

        guard let playlist = response.items.first else {
          reject("ERROR", "Playlist not found", nil)
          return
        }

        let detailedPlaylist = try await playlist.with([.tracks])

        var songs: [[String: Any]] = []

        if let tracks = detailedPlaylist.tracks {
          for track in tracks {
            switch track {
            case .song(let song):
              songs.append(convertSongToDictionary(song))
            default:
              break
            }
          }
        }

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
    Task {
      do {
        let musicItemId = MusicItemID(songId)

        var request = MusicLibraryRequest<Song>()
        request.filter(matching: \.id, equalTo: musicItemId)

        let response = try await request.response()

        guard let song = response.items.first else {
          reject("ERROR", "Song not found in library", nil)
          return
        }

        try await setQueueAndPrepare(song)
        resolve("Library song added to queue")
      } catch {
        reject("ERROR", "Failed to play library song: \(error)", error)
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
    Task {
      do {
        let musicItemId = MusicItemID(playlistId)

        var request = MusicLibraryRequest<Playlist>()
        request.filter(matching: \.id, equalTo: musicItemId)

        let response = try await request.response()

        guard let playlist = response.items.first else {
          reject("ERROR", "Playlist not found in library", nil)
          return
        }

        // Load tracks
        let detailedPlaylist = try await playlist.with([.tracks])

        guard let tracks = detailedPlaylist.tracks else {
          reject("ERROR", "No tracks in playlist", nil)
          return
        }

        // Extract songs from tracks
        var songs: [Song] = []
        for track in tracks {
          if case .song(let song) = track {
            songs.append(song)
          }
        }

        guard !songs.isEmpty else {
          reject("ERROR", "No songs in playlist", nil)
          return
        }

        // Determine starting song
        let startIndex =
          (songIndex >= 0 && songIndex < songs.count) ? songIndex : 0
        let startingSong = songs[startIndex]

        // Set queue with songs starting at specific song
        player.queue = ApplicationMusicPlayer.Queue(
          for: songs,
          startingAt: startingSong
        )
        try await player.prepareToPlay()

        resolve("Library playlist added to queue")
      } catch {
        reject("ERROR", "Failed to play library playlist: \(error)", error)
      }
    }
  }

  func convertPlaylistToDictionary(_ playlist: Playlist) -> [String: Any] {
    var artworkUrlString: String = ""

    if let artwork = playlist.artwork {
      if let artworkUrl = artwork.url(width: 200, height: 200) {
        if artworkUrl.scheme == "https" || artworkUrl.scheme == "http" {
          artworkUrlString = artworkUrl.absoluteString
        }
      }
    }

    return [
      "id": String(describing: playlist.id),
      "name": playlist.name,
      "description": playlist.standardDescription ?? "",
      "artworkUrl": artworkUrlString,
      "trackCount": playlist.tracks?.count ?? 0,
    ]
  }

  private func setQueueAndPrepare<T: PlayableMusicItem>(_ item: T) async throws
  {
    player.queue = [item]
    try await player.prepareToPlay()
  }

  /// Checks if an ID is a library ID (starts with "l." or "i." or "p.")
  private func isLibraryId(_ itemId: String) -> Bool {
    return itemId.hasPrefix("l.") || itemId.hasPrefix("i.")
      || itemId.hasPrefix("p.")
  }

  @objc(setPlaybackQueue:type:resolver:rejecter:)
  func setPlaybackQueue(
    _ itemId: String,
    type: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        let musicItemId = MusicItemID.init(itemId)
        let isLibrary = isLibraryId(itemId)

        if isLibrary {
          // Use library requests for library IDs
          if #available(iOS 16.0, *) {
            try await setLibraryItemToQueue(
              musicItemId: musicItemId,
              type: type,
              resolve: resolve,
              reject: reject
            )
          } else {
            reject("ERROR", "Library playback requires iOS 16.0 or later", nil)
          }
        } else {
          // Use catalog requests for catalog IDs
          try await setCatalogItemToQueue(
            musicItemId: musicItemId,
            type: type,
            resolve: resolve,
            reject: reject
          )
        }
      } catch {
        reject("ERROR", "Failed to set tracks to queue: \(error)", error)
      }
    }
  }

  private func setCatalogItemToQueue(
    musicItemId: MusicItemID,
    type: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) async throws {
    if let requestType = MediaType.getRequest(
      forType: type,
      musicItemId: musicItemId
    ) {
      switch requestType {
      case .song(let request):
        let response = try await request.response()
        guard let tracksToBeAdded = response.items.first else {
          reject("ERROR", "Song not found in catalog", nil)
          return
        }
        try await setQueueAndPrepare(tracksToBeAdded)
        resolve("Track(s) are added to queue")

      case .album(let request):
        let response = try await request.response()
        guard let tracksToBeAdded = response.items.first else {
          reject("ERROR", "Album not found in catalog", nil)
          return
        }
        try await setQueueAndPrepare(tracksToBeAdded)
        resolve("Album is added to queue")

      case .playlist(let request):
        let response = try await request.response()
        guard let tracksToBeAdded = response.items.first else {
          reject("ERROR", "Playlist not found in catalog", nil)
          return
        }
        try await setQueueAndPrepare(tracksToBeAdded)
        resolve("Playlist is added to queue")

      case .station(let request):
        let response = try await request.response()
        guard let tracksToBeAdded = response.items.first else {
          reject("ERROR", "Station not found in catalog", nil)
          return
        }
        try await setQueueAndPrepare(tracksToBeAdded)
        resolve("Station is added to queue")
      }
    } else {
      reject("ERROR", "Unknown media type: \(type)", nil)
    }
  }

  @available(iOS 16.0, *)
  private func setLibraryItemToQueue(
    musicItemId: MusicItemID,
    type: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) async throws {
    switch type {
    case "song":
      var request = MusicLibraryRequest<Song>()
      request.filter(matching: \.id, equalTo: musicItemId)
      let response = try await request.response()
      guard let song = response.items.first else {
        reject("ERROR", "Song not found in library", nil)
        return
      }
      try await setQueueAndPrepare(song)
      resolve("Library song added to queue")

    case "album":
      var request = MusicLibraryRequest<Album>()
      request.filter(matching: \.id, equalTo: musicItemId)
      let response = try await request.response()
      guard let album = response.items.first else {
        reject("ERROR", "Album not found in library", nil)
        return
      }
      try await setQueueAndPrepare(album)
      resolve("Library album added to queue")

    case "playlist":
      var request = MusicLibraryRequest<Playlist>()
      request.filter(matching: \.id, equalTo: musicItemId)
      let response = try await request.response()
      guard let playlist = response.items.first else {
        reject("ERROR", "Playlist not found in library", nil)
        return
      }
      // Load tracks for the playlist
      let detailedPlaylist = try await playlist.with([.tracks])
      try await setQueueAndPrepare(detailedPlaylist)
      resolve("Library playlist added to queue")

    default:
      reject("ERROR", "Unknown or unsupported library media type: \(type)", nil)
    }
  }

  enum MediaType {
    case song(MusicCatalogResourceRequest<Song>)
    case album(MusicCatalogResourceRequest<Album>)
    case playlist(MusicCatalogResourceRequest<Playlist>)
    case station(MusicCatalogResourceRequest<Station>)

    static func getRequest(forType type: String, musicItemId: MusicItemID)
      -> MediaType?
    {
      switch type {
      case "song":
        return .song(
          MusicCatalogResourceRequest<Song>(
            matching: \.id,
            equalTo: musicItemId
          )
        )
      case "album":
        return .album(
          MusicCatalogResourceRequest<Album>(
            matching: \.id,
            equalTo: musicItemId
          )
        )
      case "playlist":
        return .playlist(
          MusicCatalogResourceRequest<Playlist>(
            matching: \.id,
            equalTo: musicItemId
          )
        )
      case "station":
        return .station(
          MusicCatalogResourceRequest<Station>(
            matching: \.id,
            equalTo: musicItemId
          )
        )
      default:
        return nil
      }
    }
  }
}
