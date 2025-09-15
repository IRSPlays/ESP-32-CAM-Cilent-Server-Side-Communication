import React, { useState, useRef, useEffect } from 'react'
import { Camera, Video, VideoOff, Play, X, DollarSign } from 'lucide-react'
import { analyzeVideo as geminiAnalyzeVideo, VideoAnalysis } from '../utils/geminiApi'

interface Props {
  isOpen: boolean
  onClose: () => void
  onEarningsComplete: (result: VideoAnalysis) => void
}

const TikTokRecordingModal: React.FC<Props> = ({ isOpen, onClose, onEarningsComplete }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [trendDescription, setTrendDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Popular TikTok trends for suggestions
  const trendSuggestions = [
    "Dancing to the latest viral song with family members",
    "Cooking hack demonstration with grandparents' wisdom", 
    "Before and after organization with family help",
    "Family member swap challenge (switching roles)",
    "Generations comparing how they do the same task",
    "Teaching grandparents a modern trend",
    "Learning a traditional skill from elders"
  ]

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeCamera()
    } else {
      cleanup()
    }
    
    return cleanup
  }, [isOpen])

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasCamera(true)
      }
      streamRef.current = stream
    } catch (error) {
      console.error('Camera access failed:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
    setVideoBlob(null)
    setRecordingTime(0)
    setTrendDescription('')
    setIsAnalyzing(false)
    setHasCamera(false)
  }

  const startRecording = async () => {
    if (!streamRef.current) return
    
    try {
      // Use compatible video format for Gemini API
      let mimeType = 'video/webm;codecs=vp9'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback to formats supported by Gemini
        if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm'
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4'
        } else {
          mimeType = 'video/webm' // Final fallback
        }
      }
      
      console.log('📹 Using video MIME type:', mimeType)
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: mimeType
      })
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        setVideoBlob(blob)
        console.log('📹 Video recorded:', { 
          size: Math.round(blob.size / 1024) + 'KB',
          type: blob.type,
          duration: recordingTime + 's'
        })
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) { // 1 minute max
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
      
    } catch (error) {
      console.error('Recording failed:', error)
      alert('Recording failed. Please try again.')
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

    const analyzeVideo = async () => {
    if (!videoBlob || !trendDescription.trim()) return
    
    setIsAnalyzing(true)
    
    try {
      // Use real Gemini API analysis
      const result = await geminiAnalyzeVideo(videoBlob, trendDescription)
      
      onEarningsComplete(result)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in-up">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Camera className="w-6 h-6 text-kopi-500" />
            TikTok Trend Challenge
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            disabled={isAnalyzing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Preview */}
        <div className="mb-6 slide-in-left">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {isRecording && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full recording-pulse">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">REC {formatTime(recordingTime)}</span>
                </div>
              </div>
            )}

            {!hasCamera && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="text-center mb-6 fade-in-up">
          {!videoBlob ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!hasCamera}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 recording-pulse'
                  : 'bg-kopi-500 hover:bg-kopi-600'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? <VideoOff className="w-8 h-8" /> : <Video className="w-8 h-8" />}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3 bounce-in">
              <div className="text-green-600 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 glow-pulse">
                  <Play className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-sm shimmer">Video recorded!</p>
                <p className="text-xs text-gray-500 fade-in-up">{formatTime(recordingTime)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Trend Description */}
        <div className="mb-6 slide-in-right">
          <label className="block text-sm font-medium text-gray-700 mb-2 bounce-in">
            Describe your TikTok trend
          </label>
          <textarea
            value={trendDescription}
            onChange={(e) => setTrendDescription(e.target.value)}
            placeholder="What trend are you performing? Be creative and detailed!"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kopi-500 resize-none transition-all duration-300 hover:border-kopi-300 fade-in-up"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1 shimmer">{trendDescription.length}/200 characters</p>
        </div>

        {/* Trend Suggestions */}
        <div className="mb-6 fade-in-up">
          <p className="text-sm font-medium text-gray-700 mb-2 bounce-in">💡 Trend ideas:</p>
          <div className="flex flex-wrap gap-2">
            {trendSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setTrendDescription(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition-all duration-300 hover:scale-105 card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Button */}
        {videoBlob && (
          <div className="text-center mb-4 scale-in">
            <button
              onClick={analyzeVideo}
              disabled={isAnalyzing || !trendDescription.trim()}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-kopi-500 to-talk-500 hover:from-kopi-600 hover:to-talk-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 glow-pulse disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="shimmer">Analyzing Performance...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 animate-bounce" />
                  Analyze & Earn Money ($5-10)
                </>
              )}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gradient-to-r from-kopi-50 to-talk-50 rounded-xl p-4 fade-in-up card-hover">
          <p className="text-sm text-gray-600 text-center bounce-in">
            Record a creative TikTok trend with family members! The AI will analyze your performance and award money based on creativity, effort, and trend alignment.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TikTokRecordingModal