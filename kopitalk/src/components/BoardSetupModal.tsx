import React, { useState, useRef } from 'react'
import { Camera, Upload, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { analyzeBoardImage, BoardAnalysis } from '../utils/geminiVision'

interface Props {
  difficulty: string
  onSetupComplete: () => void
}

const BoardSetupModal: React.FC<Props> = ({ difficulty, onSetupComplete }) => {
  const [boardImage, setBoardImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<BoardAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setBoardImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError(null)
    setAnalysis(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const analyzeBoard = async () => {
    if (!boardImage) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeBoardImage(boardImage, difficulty)
      setAnalysis(result)
    } catch (err) {
      setError('Failed to analyze board. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleComplete = () => {
    if (analysis) {
      onSetupComplete()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kopi-50 via-white to-talk-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">AI Board Setup</h1>
            <p className="text-gray-600">Upload an image of your empty board for AI analysis and module placement suggestions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Upload Board Image</h3>
                
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    isDragOver
                      ? 'border-kopi-500 bg-kopi-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Board preview"
                        className="max-w-full h-48 object-contain mx-auto rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-kopi-500 hover:text-kopi-600 font-medium"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-gray-600 mb-2">
                          Drag and drop your board image here, or{' '}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-kopi-500 hover:text-kopi-600 font-medium"
                          >
                            browse files
                          </button>
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports JPG, PNG, and other image formats
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              {boardImage && !analysis && (
                <button
                  onClick={analyzeBoard}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-kopi-500 to-talk-500 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing Board...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Analyze Board with AI
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {analysis ? (
                <>
                  {/* Board Assessment */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Board Analysis Complete
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Assessment</h4>
                        <p className="text-gray-600 text-sm">{analysis.board_assessment}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-800">Complexity</p>
                          <p className="text-sm text-gray-600 capitalize">{analysis.complexity}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-800">Family Friendly</p>
                          <p className="text-sm text-gray-600">{analysis.family_friendly ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-800">Game Time</p>
                          <p className="text-sm text-gray-600">{analysis.estimated_game_time}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Module Suggestions */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Module Placement Suggestions</h3>
                    <div className="space-y-3">
                      {analysis.module_suggestions.map((suggestion: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800">{suggestion.module_type}</h4>
                              <p className="text-sm text-gray-600 mt-1">{suggestion.placement}</p>
                              <p className="text-xs text-gray-500 mt-2">{suggestion.reason}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {suggestion.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strategic Tips */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Strategic Tips</h3>
                    <ul className="space-y-2">
                      {analysis.strategic_tips.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-kopi-500 mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Complete Setup Button */}
                  <button
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Complete Board Setup
                  </button>
                </>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-center py-8">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Upload and analyze your board to see AI suggestions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoardSetupModal