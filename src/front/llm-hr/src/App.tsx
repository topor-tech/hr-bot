import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Set up MediaRecorder for recording
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }
      
      // Set up AudioContext for volume analysis
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256
      
      const microphone = audioContext.createMediaStreamSource(stream)
      microphoneRef.current = microphone
      microphone.connect(analyser)
      
      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      
      // Start volume monitoring
      updateVolumeLevel()
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Error accessing microphone. Please make sure you have granted microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setVolumeLevel(0)
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }

  const updateVolumeLevel = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // Calculate average volume level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    const normalizedVolume = (average / 255) * 100
    
    setVolumeLevel(normalizedVolume)
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateVolumeLevel)
    }
  }

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'voice-recording.wav'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
  }

  return (
    <div className="app">
      <h1>Voice Recorder</h1>
      
      <div className="recorder-container">
        {/* Volume Level Indicator */}
        <div className="volume-indicator">
          <div className="volume-bar">
            <div 
              className="volume-fill" 
              style={{ width: `${volumeLevel}%` }}
            ></div>
          </div>
          <div className="volume-text">
            Volume: {Math.round(volumeLevel)}%
          </div>
        </div>

        {/* Recording Controls */}
        <div className="controls">
          {!isRecording ? (
            <button 
              className="record-button"
              onClick={startRecording}
            >
              🎤 Start Recording
            </button>
          ) : (
            <button 
              className="stop-button"
              onClick={stopRecording}
            >
              ⏹️ Stop Recording
            </button>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="recording-status">
            <div className="recording-indicator">🔴 Recording...</div>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="audio-player">
            <h3>Recorded Audio:</h3>
            <audio controls src={audioUrl} />
            <div className="audio-actions">
              <button onClick={downloadRecording} className="download-button">
                📥 Download
              </button>
              <button onClick={clearRecording} className="clear-button">
                🗑️ Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
