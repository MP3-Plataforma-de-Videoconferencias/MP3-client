import { useCallback, useEffect, useState } from 'react'
import {
  initWebRTC,
  destroyWebRTC,
  disableOutgoingStream,
  enableOutgoingStream,
  disableOutgoingVideo,
  enableOutgoingVideo,
  onRemoteStreamsChange,
  onLocalStreamChange,
} from '../../webrtc.js'

type RemoteStreams = Record<string, MediaStream>

interface UseWebRTCOptions {
  autoStart?: boolean
}

/**
 * React hook that wraps the legacy WebRTC helpers located in the project root.
 * It exposes the local stream, the collection of remote streams and helpers
 * to toggle microphone/camera state in a React-friendly way.
 */
export function useWebRTC(options: UseWebRTCOptions = {}) {
  const { autoStart = true } = options
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreams>({})
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const unsubscribeRemote = onRemoteStreamsChange((streams: RemoteStreams) => {
      setRemoteStreams(streams)
    })
    const unsubscribeLocal = onLocalStreamChange((stream: MediaStream | null) => {
      setLocalStream(stream ?? null)
    })

    if (autoStart) {
      Promise.resolve(initWebRTC())
        .then(() => setIsReady(true))
        .catch((error: unknown) => {
          console.error('Failed to initialize WebRTC', error)
          setIsReady(false)
        })
    }

    return () => {
      unsubscribeRemote()
      unsubscribeLocal()
      if (autoStart) {
        destroyWebRTC()
      }
    }
  }, [autoStart])

  const setMicEnabled = useCallback((enabled: boolean) => {
    if (enabled) {
      enableOutgoingStream()
    } else {
      disableOutgoingStream()
    }
  }, [])

  const setVideoEnabled = useCallback((enabled: boolean) => {
    if (enabled) {
      enableOutgoingVideo()
    } else {
      disableOutgoingVideo()
    }
  }, [])

  const endCall = useCallback(() => {
    destroyWebRTC()
    setIsReady(false)
  }, [])

  return {
    localStream,
    remoteStreams,
    isReady,
    setMicEnabled,
    setVideoEnabled,
    endCall,
  }
}

