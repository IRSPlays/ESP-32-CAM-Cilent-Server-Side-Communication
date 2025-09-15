import React, { useState, useRef, useEffect } from 'react'
import { Camera, Video, VideoOff, Play, X, Upload, DollarSign } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onEarningsComplete: (result: { earnings: number; feedback: string; performance_score: number }) => void
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
  const timerRef = useRef<number | null>(null)

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
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      })
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setVideoBlob(blob)
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
    if (!videoBlob || !trendDescription.trim()) {
      alert('Please record a video and add a description!')
      return
    }
    
    setIsAnalyzing(true)
    
    try {
      // Simulate Gemini API analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate realistic earnings based on video and description
      const videoSize = videoBlob.size / (1024 * 1024) // MB
      const descriptionLength = trendDescription.length
      
      // Base performance calculation
      let performance = Math.random() * 0.4 + 0.5 // 50-90% base
      
      // Bonus for longer description (shows effort)
      if (descriptionLength > 50) performance += 0.1
      if (descriptionLength > 100) performance += 0.1
      
      // Bonus for reasonable video size (shows actual recording)
      if (videoSize > 0.5) performance += 0.1
      if (videoSize > 2) performance += 0.1
      
      // Cap at 100%
      performance = Math.min(performance, 1)
      
      const earnings = Math.floor(performance * 50) + 10 // $10-60
      const performanceScore = Math.round(performance * 100)
      
      const feedbackMessages = [
        `Excellent creativity! Your trend interpretation was ${performanceScore}% on point.`,
        `Great performance! The AI detected ${performanceScore}% trend alignment.`,
        `Nice work! You captured ${performanceScore}% of the trending elements.`,
        `Well done! Your video scored ${performanceScore}% for authenticity and fun.`
      ]
      
      const result = {
        earnings,
        performance_score: performanceScore,
        feedback: feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
      }
      
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Camera className="w-6 h-6 text-kopi-500" />
            TikTok Trend Challenge
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isAnalyzing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Preview */}
        <div className="mb-6">
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
                <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
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
        <div className="text-center mb-6">
          {!videoBlob ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!hasCamera}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 recording-pulse'
                  : 'bg-kopi-500 hover:bg-kopi-600'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? <VideoOff className="w-8 h-8" /> : <Video className="w-8 h-8" />}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <div className="text-green-600 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Play className="w-6 h-6" />
                </div>
                <p className="text-sm">Video recorded!</p>
                <p className="text-xs text-gray-500">{formatTime(recordingTime)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Trend Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your TikTok trend
          </label>
          <textarea
            value={trendDescription}
            onChange={(e) => setTrendDescription(e.target.value)}
            placeholder="What trend are you performing? Be creative and detailed!"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kopi-500 resize-none"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">{trendDescription.length}/200 characters</p>
        </div>

        {/* Trend Suggestions */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">💡 Trend ideas:</p>
          <div className="flex flex-wrap gap-2">
            {trendSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setTrendDescription(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Button */}
        {videoBlob && (
          <div className="text-center mb-4">
            <button
              onClick={analyzeVideo}
              disabled={isAnalyzing || !trendDescription.trim()}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-kopi-500 to-talk-500 hover:from-kopi-600 hover:to-talk-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Performance...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Analyze & Earn Money ($10-60)
                </>
              )}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gradient-to-r from-kopi-50 to-talk-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 text-center">
            Record a creative TikTok trend with family members! The AI will analyze your performance and award money based on creativity, effort, and trend alignment.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TikTokRecordingModal