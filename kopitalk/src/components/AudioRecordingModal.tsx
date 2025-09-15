import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Pause, Upload, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAnalysisComplete: (result: { quality: number; movement: number; earnings: number; feedback: string }) => void
}

const AudioRecordingModal: React.FC<Props> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<number | null>(null)

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
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
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
      // Simulate Gemini API analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate realistic results based on recording duration
      const duration = recordingTime
      const baseQuality = Math.random() * 0.4 + 0.6 // 60-100%
      const durationBonus = Math.min(duration / 30, 1) // Bonus for longer recordings
      
      const quality = Math.min(baseQuality + (durationBonus * 0.3), 1)
      const movement = Math.floor(quality * 3) + 1 // 1-3 spaces
      const earnings = Math.floor(quality * 15) + 5 // $5-20
      
      const feedbackMessages = [
        "Great storytelling! The AI detected engaging conversation patterns.",
        "Good family bonding moment detected. Keep sharing those memories!",
        "Nice emotional connection! The discussion shows genuine interest.",
        "Excellent intergenerational dialogue. Both perspectives were valued."
      ]
      
      const result = {
        quality: Math.round(quality * 100),
        movement,
        earnings,
        feedback: feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
      }
      
      onAnalysisComplete(result)
      onClose()
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
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