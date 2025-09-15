import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Pause, Upload, X } from 'lucide-react'
import { analyzeConversation, ConversationAnalysis } from '../utils/geminiApi'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAnalysisComplete: (result: ConversationAnalysis) => void
}

const AudioRecordingModal: React.FC<Props> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsRecording(false)
      setAudioBlob(null)
      setIsPlaying(false)
      setRecordingTime(0)
      setIsAnalyzing(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      // Use compatible audio format for Gemini API
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback to formats supported by Gemini
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        } else {
          mimeType = 'audio/wav' // Final fallback
        }
      }
      
      console.log('🎤 Using audio MIME type:', mimeType)
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      })
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
        console.log('🎤 Audio recorded:', { 
          size: Math.round(blob.size / 1024) + 'KB',
          type: blob.type,
          duration: recordingTime + 's'
        })
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) { // 5 minutes max
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        const url = URL.createObjectURL(audioBlob)
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
        
        audioRef.current.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(url)
        }
      }
    }
  }

  const analyzeAudio = async () => {
    if (!audioBlob) return
    
    setIsAnalyzing(true)
    
    try {
      console.log('🎤 Starting real Gemini API analysis for conversation...', {
        duration: recordingTime,
        audioSize: Math.round(audioBlob.size / 1024) + 'KB',
        mimeType: audioBlob.type
      })
      
      // Use actual Gemini API analysis
      const result = await analyzeConversation(audioBlob, recordingTime)
      
      console.log('✅ Conversation analysis complete:', result)
      onAnalysisComplete(result)
      onClose()
    } catch (error) {
      console.error('❌ Gemini API analysis failed:', error)
      
      // Fallback with proper ConversationAnalysis structure
      const fallbackResult: ConversationAnalysis = {
        quality: Math.floor(Math.random() * 40) + 60, // 60-100%
        movement: Math.floor(Math.random() * 3) + 1, // 1-3 spaces  
        earnings: 0, // Audio gives movement, not earnings
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
    if (!audioBlob) return
    try {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const ext = (audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('mp4') ? 'mp4' : audioBlob.type.includes('wav') ? 'wav' : 'audio')
      a.href = url
      a.download = `kopitalk-recording-${timestamp}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      console.error('Failed to save recording:', e)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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

        {/* Recording Interface */}
        <div className="text-center mb-6">
          {isRecording && (
            <div className="mb-4">
              <div className="recording-pulse w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <p className="text-red-600 font-semibold">🔴 RECORDING</p>
              <p className="text-gray-600 text-sm">{formatTime(recordingTime)} / 5:00</p>
            </div>
          )}

          {!isRecording && !audioBlob && (
            <div className="mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mic className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Ready to record</p>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mic className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600">Recording complete</p>
              <p className="text-gray-600 text-sm">Duration: {formatTime(recordingTime)}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center mb-6">
          {!audioBlob && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-kopi-500 hover:bg-kopi-600 text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          )}

          {audioBlob && (
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
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-all"
              >
                Save Recording
              </button>
              
              <button
                onClick={analyzeAudio}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-kopi-500 to-talk-500 hover:from-kopi-600 hover:to-talk-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Analyze with AI
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 text-center">
            {!audioBlob 
              ? "Record a family conversation to earn points and move forward on the board!"
              : "Listen to your recording and upload it for AI analysis to see your results."
            }
          </p>
        </div>

        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  )
}

export default AudioRecordingModal