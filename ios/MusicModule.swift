// MusicModule.swift
import Foundation
import React
import StoreKit
import MusicKit
import Combine

@available(iOS 15.0, *)
@objc(MusicModule)
class MusicModule: RCTEventEmitter {

  private var queueObservation: AnyCancellable?
  private var stateObservation: AnyCancellable?
  private var currentPlaybackStatus: MusicPlayer.PlaybackStatus?
  private var lastReportedPlaybackStatus: MusicPlayer.PlaybackStatus?

  override init() {
      super.init()
      startObservingPlaybackState()
      startObservingQueueChanges()
  }

  override func supportedEvents() -> [String]! {
      return ["onPlaybackStateChange", "onCurrentSongChange"]
  }

  private func startObservingPlaybackState() {
    stateObservation = SystemMusicPlayer.shared.state.objectWillChange.sink { [weak self] _ in
      self?.sendPlaybackStateUpdate()
    }
  }

  private func startObservingQueueChanges() {
          queueObservation = SystemMusicPlayer.shared.queue.objectWillChange.sink { [weak self] _ in
              self?.sendCurrentSongUpdate()
          }
      }

  private func sendCurrentSongUpdate() {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
          guard let self = self else { return }

          self.getCurrentSongInfo { songInfo in
              if let songInfo = songInfo {
                  self.sendEvent(withName: "onCurrentSongChange", body: ["currentSong": songInfo])
              }
          }
      }
  }

  private func sendPlaybackStateUpdate() {
      let state = SystemMusicPlayer.shared.state
      let playbackTime = SystemMusicPlayer.shared.playbackTime
      let playbackStatusDescription = describePlaybackStatus(state.playbackStatus)
      let playbackRate = state.playbackRate

      if lastReportedPlaybackStatus != state.playbackStatus {
          self.getCurrentSongInfo { songInfo in
              var playbackInfo: [String: Any] = [
                  "playbackRate": playbackRate,
                  "playbackStatus": playbackStatusDescription,
                  "playbackTime": playbackTime
              ]

              if let songInfo = songInfo {
                  playbackInfo["currentSong"] = songInfo
              }

              self.sendEvent(withName: "onPlaybackStateChange", body: playbackInfo)
          }

          lastReportedPlaybackStatus = state.playbackStatus
      }
  }

  @objc(getCurrentState:)
  func getCurrentState(_ callback: @escaping RCTResponseSenderBlock) {
      let state = SystemMusicPlayer.shared.state
      let playbackTime = SystemMusicPlayer.shared.playbackTime
      let playbackStatusDescription = describePlaybackStatus(state.playbackStatus)
      let playbackRate = state.playbackRate

      self.getCurrentSongInfo { songInfo in
          var currentState: [String: Any] = [
              "playbackRate": playbackRate,
              "playbackStatus": playbackStatusDescription,
              "playbackTime": playbackTime
          ]

          if let songInfo = songInfo {
              currentState["currentSong"] = songInfo
          }

          callback([currentState])
      }
  }

  private func getCurrentSongInfo(completion: @escaping ([String: Any]?) -> Void) {
      guard let currentEntry = SystemMusicPlayer.shared.queue.currentEntry else {
          print("No current entry in the playback queue")
          completion(nil)
          return
      }

      switch currentEntry.item {
      case .song(let song):
          Task {
              let songID = song.id
              let request = MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: songID)
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
          print("The current item is a music video: \(musicVideo.title)")
          completion(nil)

      default:
          print("The current item is neither a song nor a music video")
          completion(nil)
      }
  }


  private func describePlaybackStatus(_ status: MusicPlayer.PlaybackStatus) -> String {
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

  @objc
  static override func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(checkSubscription:rejecter:)
    func checkSubscription(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      SKCloudServiceController().requestCapabilities { (capabilities, error) in
        if let error = error {
          reject("ERROR", "Failed to get subscription details: \(error)", error)
          return
        }

        let canPlayCatalogContent = capabilities.contains(.musicCatalogPlayback)
        let hasCloudLibraryEnabled = capabilities.contains(.addToCloudMusicLibrary)

        let subscriptionDetails: [String: Any] = [
            "canPlayCatalogContent": canPlayCatalogContent,
            "hasCloudLibraryEnabled": hasCloudLibraryEnabled
        ]

        resolve(subscriptionDetails)
      }
    }

  @objc(togglePlayerState)
  func togglePlayerState() {
      let playbackState = SystemMusicPlayer.shared.state.playbackStatus

      switch playbackState {
      case .playing:
          SystemMusicPlayer.shared.pause()
      case .paused, .stopped, .interrupted:
          Task {
              do {
                  try await SystemMusicPlayer.shared.play()
              } catch {
                  print("Error attempting to play music: \(error)")
              }
          }
      default:
          Task {
              do {
                  try await SystemMusicPlayer.shared.play()
              } catch {
                  print("Error attempting to play music: \(error)")
              }
          }
      }
  }

  @objc(play)
      func play() {
          Task {
              do {
                  try await SystemMusicPlayer.shared.play()
              } catch {
                  print("Play failed: \(error)")
              }
          }
      }

  @objc(pause)
  func pause() {
      SystemMusicPlayer.shared.pause()
  }

  @objc(skipToNextEntry)
      func skipToNextEntry() {
          Task {
              do {
                  try await SystemMusicPlayer.shared.skipToNextEntry()
              } catch {
                  print("Next failed: \(error)")
              }
          }
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
          let artworkUrl = artwork.url(width: 200, height: 200)

          if let url = artworkUrl, url.scheme == "musicKit" {
              print("Artwork URL is a MusicKit URL, may not be directly accessible: \(url)")
          } else {
              artworkUrlString = artworkUrl?.absoluteString ?? ""
          }
      }

      return [
          "id": String(describing: song.id),
          "title": song.title,
          "artistName": song.artistName,
          "artworkUrl": artworkUrlString,
          "duration": String(song.duration ?? 0)
      ]
  }

  @objc(catalogSearch:types:options:resolver:rejecter:)
  func catalogSearch(_ term: String, types: [String], options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      Task {
          let searchTypes = types.compactMap { typeString -> MusicCatalogSearchable.Type? in
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
              resolve(["results": songs])
          } catch {
              reject("ERROR", "Failed to perform catalog search: \(error)", error)
          }
      }
  }
}
