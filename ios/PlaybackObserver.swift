// PlaybackObserver.swift
// Modern Swift Concurrency-based observation for playback state and time updates.
// Performance-optimized: network calls run off main thread, only UI updates on MainActor.

import Combine
import Foundation
import MusicKit

/// Protocol for receiving playback observation events.
@available(iOS 15.0, *)
protocol PlaybackObserverDelegate: AnyObject {
  @MainActor func playbackStateDidChange(_ state: PlaybackObserver.PlaybackInfo)
  @MainActor func currentSongDidChange(_ songInfo: [String: Any]?)
  @MainActor func playbackTimeDidUpdate(_ time: TimeInterval)
}

@available(iOS 15.0, *)
final class PlaybackObserver {

  // MARK: - Types

  struct PlaybackInfo {
    let playbackStatus: String
    let playbackRate: Float
    let playbackTime: TimeInterval
    let currentSong: [String: Any]?
  }

  // MARK: - Properties

  weak var delegate: PlaybackObserverDelegate?

  private let playbackController: PlaybackController
  private var stateObservationTask: Task<Void, Never>?
  private var queueObservationTask: Task<Void, Never>?
  private var timeUpdateTask: Task<Void, Never>?

  /// Thread-safe access to last reported status using actor isolation
  private let statusTracker = StatusTracker()

  /// Time update interval - 1 second provides good UX with less main thread pressure
  private let timeUpdateInterval: TimeInterval = 1.0

  // MARK: - Initialization

  init(playbackController: PlaybackController = .shared) {
    self.playbackController = playbackController
  }

  deinit {
    stopObserving()
  }

  // MARK: - Observation Lifecycle

  func startObserving() {
    startStateObservation()
    startQueueObservation()
    // Start time updates if already playing
    if playbackController.state.playbackStatus == .playing {
      startTimeUpdates()
    }
  }

  func stopObserving() {
    stateObservationTask?.cancel()
    queueObservationTask?.cancel()
    timeUpdateTask?.cancel()
    stateObservationTask = nil
    queueObservationTask = nil
    timeUpdateTask = nil
    // Note: statusTracker doesn't need explicit reset - it will be deallocated with self
  }

  // MARK: - State Observation (Swift Concurrency)

  private func startStateObservation() {
    stateObservationTask?.cancel()
    
    // Capture dependencies outside the task to avoid capturing self
    let playbackController = self.playbackController
    let statusTracker = self.statusTracker
    weak var weakDelegate = self.delegate
    weak var weakSelf = self
    
    stateObservationTask = Task.detached {
      // Use AsyncStream to bridge objectWillChange
      let stateStream = AsyncStream<Void> { continuation in
        let cancellable = ApplicationMusicPlayer.shared.state.objectWillChange.sink { _ in
          continuation.yield()
        }
        continuation.onTermination = { _ in
          cancellable.cancel()
        }
      }

      for await _ in stateStream {
        guard !Task.isCancelled else { break }
        
        let state = playbackController.state
        let currentStatus = state.playbackStatus
        
        // Check if status actually changed (thread-safe via actor)
        let shouldEmit = await statusTracker.updateIfChanged(currentStatus)
        guard shouldEmit, !Task.isCancelled else { continue }
        
        // Fetch song info on background thread
        let songInfo = await playbackController.fetchCurrentSongInfo()
        guard !Task.isCancelled else { break }
        
        let info = PlaybackInfo(
          playbackStatus: MusicItemMapper.describePlaybackStatus(currentStatus),
          playbackRate: state.playbackRate,
          playbackTime: playbackController.playbackTime,
          currentSong: songInfo
        )
        
        // Only hop to main thread for the UI callback
        await MainActor.run {
          weakDelegate?.playbackStateDidChange(info)
          
          // Manage time updates based on playback state
          if currentStatus == .playing {
            weakSelf?.startTimeUpdates()
          } else {
            weakSelf?.stopTimeUpdates()
          }
        }
      }
    }
  }

  private func startQueueObservation() {
    queueObservationTask?.cancel()
    
    // Capture dependencies outside the task to avoid capturing self
    let playbackController = self.playbackController
    weak var weakDelegate = self.delegate
    
    queueObservationTask = Task.detached {
      let queueStream = AsyncStream<Void> { continuation in
        let cancellable = ApplicationMusicPlayer.shared.queue.objectWillChange.sink { _ in
          continuation.yield()
        }
        continuation.onTermination = { _ in
          cancellable.cancel()
        }
      }

      for await _ in queueStream {
        guard !Task.isCancelled else { break }
        
        // Small delay to let queue settle (on background thread)
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
        guard !Task.isCancelled else { break }
        
        // Fetch song info on background thread
        let songInfo = await playbackController.fetchCurrentSongInfo()
        guard !Task.isCancelled else { break }
        
        // Only hop to main thread for the UI callback
        await MainActor.run {
          weakDelegate?.currentSongDidChange(songInfo)
        }
      }
    }
  }

  // MARK: - Time Updates (Detached Task-based Timer)

  private func startTimeUpdates() {
    guard timeUpdateTask == nil else { return }

    // Capture dependencies outside the task to avoid capturing self
    let playbackController = self.playbackController
    let timeUpdateInterval = self.timeUpdateInterval
    weak var weakDelegate = self.delegate

    timeUpdateTask = Task.detached {
      while !Task.isCancelled {
        let time = playbackController.playbackTime
        let safeTime = time.isNaN ? 0 : time

        // Minimal main thread work - just the delegate call
        await MainActor.run {
          weakDelegate?.playbackTimeDidUpdate(safeTime)
        }

        try? await Task.sleep(nanoseconds: UInt64(timeUpdateInterval * 1_000_000_000))
      }
    }
  }

  private func stopTimeUpdates() {
    timeUpdateTask?.cancel()
    timeUpdateTask = nil
  }
}

// MARK: - Status Tracker Actor

/// Thread-safe tracker for last reported playback status
@available(iOS 15.0, *)
private actor StatusTracker {
  private var lastReportedStatus: MusicPlayer.PlaybackStatus?

  /// Returns true if the status changed and was updated
  func updateIfChanged(_ newStatus: MusicPlayer.PlaybackStatus) -> Bool {
    if lastReportedStatus != newStatus {
      lastReportedStatus = newStatus
      return true
    }
    return false
  }

  func reset() {
    lastReportedStatus = nil
  }
}
