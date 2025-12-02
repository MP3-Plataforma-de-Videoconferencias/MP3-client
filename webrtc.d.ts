export function initWebRTC(): Promise<void> | void
export function destroyWebRTC(): void
export function disableOutgoingStream(): void
export function enableOutgoingStream(): void
export function disableOutgoingVideo(): void
export function enableOutgoingVideo(): void
export function onRemoteStreamsChange(
  callback: (streams: Record<string, MediaStream>) => void
): () => void
export function onLocalStreamChange(callback: (stream: MediaStream | null) => void): () => void
export function getRemoteStreams(): Record<string, MediaStream>
export function getLocalMediaStream(): MediaStream | null
export function connectToPeer(peerSocketId: string): Promise<void>
export function getSocketId(): string | null
export function setExternalSocket(socketInstance: any): void

