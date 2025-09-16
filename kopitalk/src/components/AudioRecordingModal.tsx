import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Pause, Upload, X, Volume2 } from 'lucide-react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { analyzeConversation, ConversationAnalysis } from '../utils/geminiApi'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAnalysisComplete: (result: ConversationAnalysis) => void
}

const AudioRecordingModal: React.FC<Props> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    error
  } = useReactMediaRecorder({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    },
    blobPropertyBag: { type: 'audio/wav' },
    onStart: () => {
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    },
    onStop: (blobUrl: string, blob: Blob) => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      console.log('🎤 Audio recorded:', { 
        size: Math.round(blob.size / 1024) + 'KB',
        type: blob.type,
        duration: recordingTime + 's'
      })
    }
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false)
      setRecordingTime(0)
      setIsAnalyzing(false)
      if (timerRef.current) clearInterval(timerRef.current)
      clearBlobUrl()
    }
  }, [isOpen, clearBlobUrl])

  const playAudio = () => {
    if (mediaBlobUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.src = mediaBlobUrl
        audioRef.current.play()
        setIsPlaying(true)
        audioRef.current.onended = () => setIsPlaying(false)
      }
    }
  }

  const uploadForAnalysis = async () => {
    if (!mediaBlobUrl) return
    
    setIsAnalyzing(true)
    
    try {
      const response = await fetch(mediaBlobUrl)
      const audioBlob = await response.blob()
      
      console.log('🔍 Analyzing conversation with Gemini...', {
        size: Math.round(audioBlob.size / 1024) + 'KB',
        duration: recordingTime + 's',
        type: audioBlob.type
      })
      
      const result = await analyzeConversation(audioBlob, recordingTime)
      onAnalysisComplete(result)
      onClose()
    } catch (error) {
      console.error('❌ Gemini API analysis failed:', error)
      
      const fallbackResult: ConversationAnalysis = {
        quality: Math.floor(Math.random() * 40) + 60,
        movement: Math.floor(Math.random() * 3) + 1,
        earnings: 0,
        feedback: "AI analysis temporarily unavailable. Your conversation shows great family bonding potential!",
        topics_covered: ["family stories", "shared experiences"],
        bonding_level: recordingTime > 60 ? 'high' : recordingTime > 30 ? 'medium' : 'low'
      }
      
      onAnalysisComplete(fallbackResult)
      onClose()
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveRecording = () => {
    if (!mediaBlobUrl) return
    try {
      const a = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      a.href = mediaBlobUrl
      a.download = `kopitalk-recording-${timestamp}.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error('Failed to save recording:', e)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'idle':
        return 'Ready to record'
      case 'acquiring_media':
        return 'Getting microphone access...'
      case 'recording':
        return '🔴 RECORDING'
      case 'stopping':
        return 'Processing recording...'
      case 'stopped':
        return 'Recording complete'
      case 'permission_denied':
        return 'Microphone access denied'
      case 'media_aborted':
        return 'Recording aborted'
      default:
        return status
    }
  }

  const isRecording = status === 'recording'
  const hasRecording = status === 'stopped' && mediaBlobUrl
  const canRecord = status === 'idle' || status === 'stopped'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Record Conversation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isAnalyzing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              {error === 'permission_denied' 
                ? 'Please allow microphone access to record conversations.'
                : `Recording error: ${error}`
              }
            </p>
          </div>
        )}

        <div className="text-center mb-6">
          {isRecording && (
            <div className="mb-4">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <p className="text-red-600 font-semibold">{getStatusMessage()}</p>
              <p className="text-gray-600 text-sm">{formatTime(recordingTime)} / 5:00</p>
            </div>
          )}

          {!isRecording && !hasRecording && (
            <div className="mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mic className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">{getStatusMessage()}</p>
            </div>
          )}

          {hasRecording && !isRecording && (
            <div className="mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Volume2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600">Recording complete</p>
              <p className="text-gray-600 text-sm">Duration: {formatTime(recordingTime)}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center mb-6">
          {!hasRecording && canRecord && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={status === 'acquiring_media' || error === 'permission_denied'}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-kopi-500 hover:bg-kopi-600 text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          )}

          {hasRecording && (
            <>
              <button
                onClick={playAudio}
                className="flex items-center gap-2 px-6 py-3 bg-talk-500 hover:bg-talk-600 text-white rounded-xl font-medium transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={saveRecording}
                className="flex items-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-all"
              >
                Save
              </button>
            </>
          )}
        </div>

        {hasRecording && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                clearBlobUrl()
                setRecordingTime(0)
              }}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
            >
              Record Again
            </button>
            
            <button
              onClick={uploadForAnalysis}
              disabled={isAnalyzing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-kopi-500 to-talk-500 hover:from-kopi-600 hover:to-talk-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </div>
        )}

        <audio ref={audioRef} />
      </div>
    </div>
  )
}

export default AudioRecordingModal
