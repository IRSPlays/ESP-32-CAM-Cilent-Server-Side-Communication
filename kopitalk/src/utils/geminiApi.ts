import { GoogleGenAI } from '@google/genai'

// Initialize Gemini API using the new SDK (you'll need to add your API key in .env file)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || 'demo-key'

// Initialize with proper error handling following 2025 standards
let genAI: GoogleGenAI | null = null
try {
  genAI = new GoogleGenAI(API_KEY)
  console.log('✅ Gemini API initialized successfully with key:', API_KEY ? '***' + API_KEY.slice(-4) : 'NOT_PROVIDED')
} catch (error) {
  console.error('❌ Failed to initialize Gemini API:', error)
  console.warn('Please set VITE_GEMINI_API_KEY or VITE_GOOGLE_API_KEY environment variable')
}

// Allow overriding model via env; default to 1.5-flash
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'

export interface ConversationAnalysis {
  quality: number // 1-100
  movement: number // 1-5 moves
  earnings: number // $0 for audio (movement only)
  feedback: string
  topics_covered: string[]
  bonding_level: 'low' | 'medium' | 'high' | 'excellent'
}

export interface VideoAnalysis {
  performance_score: number // 1-100
  earnings: number // $5-$10
  feedback: string
  creativity_level: 'basic' | 'good' | 'great' | 'amazing'
}

export interface RandomEvent {
  type: 'positive' | 'negative' | 'funny_face' | 'funny_dance' | 'snack_time' | 'drink_time'
  title: string
  description: string
  emoji: string
  effect?: {
    money?: number
    movement?: number
    points?: number
  }
}

// Conversation topics for intergenerational bonding
export const conversationTopics = [
  "Share a childhood memory from your generation",
  "What technology surprised you the most in your lifetime?",
  "Tell me about your favorite family tradition",
  "What advice would you give to someone from a different generation?",
  "Describe how family meals were different when you were young",
  "What song or music brings back special memories?",
  "Share a story about your first job or school experience",
  "What games did you play as a child?",
  "Tell me about a historical event you remember",
  "What's the biggest change you've seen in your neighborhood?",
  "Share a funny family story or embarrassing moment",
  "What skills do you think each generation should learn from the other?"
]

// Random events that happen after conversations
const randomEvents: RandomEvent[] = [
  {
    type: 'positive',
    title: 'Positive Card',
    description: 'Your heartfelt conversation touched everyone! Bonus points for emotional connection.',
    emoji: '😔',
    effect: { points: 10, money: 5 }
  },
  {
    type: 'negative', 
    title: 'Negative Card',
    description: 'Someone got a bit grumpy during the discussion. Take it with humor!',
    emoji: '🤪',
    effect: { points: -5 }
  },
  {
    type: 'funny_face',
    title: 'Funny Face',
    description: 'Someone made such a funny expression! Everyone bursts into laughter.',
    emoji: '💃',
    effect: { points: 8, movement: 1 }
  },
  {
    type: 'funny_dance',
    title: 'Funny Dance',
    description: 'The conversation got so lively, someone started dancing! Move ahead extra spaces.',
    emoji: '💃',
    effect: { movement: 2, points: 12 }
  },
  {
    type: 'snack_time',
    title: 'Snack Time',
    description: 'All this talking made everyone hungry! Time for some family snacks.',
    emoji: '🍿',
    effect: { points: 5 }
  },
  {
    type: 'drink_time',
    title: 'Drink Time', 
    description: 'The conversation was so engaging, everyone needs a drink break!',
    emoji: '🥤',
    effect: { points: 5 }
  }
]

export const getRandomTopic = (): string => {
  return conversationTopics[Math.floor(Math.random() * conversationTopics.length)]
}

export const getRandomEvent = (): RandomEvent => {
  return randomEvents[Math.floor(Math.random() * randomEvents.length)]
}

export const analyzeConversation = async (audioBlob: Blob, duration: number): Promise<ConversationAnalysis> => {
  try {
    // Check if API is properly initialized
    if (!genAI) {
      throw new Error('❌ Gemini API not initialized. Please check your API key configuration.')
    }

  console.log(`🎙️ Analyzing conversation with Gemini model=${MODEL} (multimodal)...`, {
      duration: duration + 's',
      audioType: audioBlob.type,
      audioSize: Math.round(audioBlob.size / 1024) + 'KB',
      maxSizeSupported: '20MB',
      supportedFormats: ['audio/wav', 'audio/mp3', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac']
    })

    // Validate audio blob
    if (audioBlob.size === 0) {
      throw new Error('Empty audio blob received')
    }

    if (audioBlob.size > 20 * 1024 * 1024) { // 20MB limit
      throw new Error('Audio file too large (max 20MB)')
    }

    // Convert audio to base64 for Gemini with proper error handling
    console.log('🔄 Converting audio to base64...')
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
    console.log('✅ Base64 conversion complete, length:', base64Audio.length)
    
    const prompt = `
    Analyze this family conversation recording for intergenerational bonding quality.
    Audio duration: ${duration} seconds
    
    Please evaluate:
    1. Quality of conversation (1-100)
    2. Intergenerational engagement level
    3. Topics discussed
    4. Emotional connection observed
    5. Family bonding effectiveness
    
    Focus on how well different generations (elderly and young) are connecting and sharing.
    Return a quality score and suggest movement (1-5 spaces) based on conversation depth.
    
    Respond in JSON format with: quality, movement, feedback, topics_covered, bonding_level
    `
    
    // Use CORRECT multimodal API pattern based on @google/genai v1.19.0
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user', 
          parts: [
            {
              inlineData: {
                mimeType: audioBlob.type || 'audio/webm',
                data: base64Audio
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]
    })

    // Use CORRECT response access with proper error handling
    console.log('📨 Raw API response received:', response)
    
    if (!response || !response.candidates || !response.candidates[0] || !response.candidates[0].content) {
      throw new Error('Empty response from Gemini API')
    }
    
    const analysisText = response.candidates[0].content.parts?.[0]?.text
    if (!analysisText) {
      throw new Error('No text content in Gemini API response')
    }
    
    console.log('✅ Received analysis from Gemini API (length:', analysisText.length, '):', analysisText.substring(0, 200) + '...')
    
    // Clean up JSON response (remove markdown formatting if present)
    const cleanText = analysisText.replace(/```json\n?|\n?```/g, '').trim()
    
    let analysis
    try {
      analysis = JSON.parse(cleanText)
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON response, using fallback. Raw text:', cleanText)
      throw new Error(`Invalid JSON response: ${parseError}`)
    }
    
    return {
      quality: analysis.quality || Math.floor(Math.random() * 40) + 60,
      movement: analysis.movement || Math.floor(Math.random() * 5) + 1,
      earnings: 0, // Audio gives movement, not money
      feedback: analysis.feedback || "Great family conversation! Keep sharing stories across generations.",
      topics_covered: analysis.topics_covered || ["family memories", "generational differences"],
      bonding_level: analysis.bonding_level || 'medium'
    }
    
  } catch (error) {
    console.error('❌ Gemini API conversation analysis error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      duration,
      audioSize: audioBlob.size,
      audioType: audioBlob.type
    })
    
    // Enhanced fallback analysis based on duration and realistic patterns
    const baseQuality = Math.random() * 40 + 50 // 50-90%
    const durationBonus = Math.min(duration / 60, 1) // Up to 1 minute bonus
    const quality = Math.min(baseQuality + (durationBonus * 20), 100)
    
    const fallbackAnalysis: ConversationAnalysis = {
      quality: Math.round(quality),
      movement: Math.floor(quality / 20) + 1, // 1-5 based on quality
      earnings: 0, // Audio gives movement, not money
      feedback: `AI analysis temporarily unavailable. Duration: ${duration}s suggests ${quality > 80 ? 'excellent' : quality > 60 ? 'good' : 'basic'} engagement level.`,
      topics_covered: ["family stories", "shared memories", "generational wisdom", "life experiences"],
      bonding_level: quality > 80 ? 'excellent' : quality > 60 ? 'high' : quality > 40 ? 'medium' : 'low'
    }
    
    console.log('🔄 Using fallback analysis:', fallbackAnalysis)
    return fallbackAnalysis
  }
}

export const analyzeVideo = async (videoBlob: Blob, description: string): Promise<VideoAnalysis> => {
  try {
    // Check if API is properly initialized
    if (!genAI) {
      throw new Error('❌ Gemini API not initialized. Please check your API key configuration.')
    }

  console.log(`📹 Analyzing TikTok video with Gemini model=${MODEL} (multimodal vision)...`, {
      description,
      videoType: videoBlob.type,
      videoSize: Math.round(videoBlob.size / 1024) + 'KB',
      maxSizeSupported: '20MB',
      supportedFormats: ['video/mp4', 'video/mpeg', 'video/mov', 'video/avi', 'video/x-flv', 'video/mpg', 'video/webm', 'video/wmv', 'video/3gpp']
    })

    // Validate video blob
    if (videoBlob.size === 0) {
      throw new Error('Empty video blob received')
    }

    if (videoBlob.size > 20 * 1024 * 1024) { // 20MB limit
      throw new Error('Video file too large (max 20MB)')
    }

    if (!description.trim()) {
      throw new Error('Video description is required for analysis')
    }

    console.log('🔄 Converting video to base64...')
    const arrayBuffer = await videoBlob.arrayBuffer()
    const base64Video = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
    console.log('✅ Video base64 conversion complete, length:', base64Video.length)
    
    const prompt = `
    Analyze this TikTok trend video for creativity and family engagement.
    Description: "${description}"
    
    Evaluate:
    1. Creativity and effort (1-100)
    2. Family participation and fun
    3. Trend execution quality
    4. Intergenerational bonding visible
    
    Award earnings between $5-$10 based on performance.
    Focus on how well different generations participate together.
    
    Respond in JSON format with: performance_score, earnings, feedback, creativity_level
    `
    
    // Use CORRECT multimodal API pattern based on @google/genai v1.19.0
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: videoBlob.type || 'video/webm',
                data: base64Video
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]
    })

    // Use CORRECT response access with proper error handling
    console.log('📨 Raw video API response received:', response)
    
    if (!response || !response.candidates || !response.candidates[0] || !response.candidates[0].content) {
      throw new Error('Empty response from Gemini Video API')
    }
    
    const analysisText = response.candidates[0].content.parts?.[0]?.text
    if (!analysisText) {
      throw new Error('No text content in Gemini Video API response')
    }
    console.log('✅ Received video analysis from Gemini API (length:', analysisText.length, '):', analysisText.substring(0, 200) + '...')
    
    // Clean up JSON response (remove markdown formatting if present)
    const cleanText = analysisText.replace(/```json\n?|\n?```/g, '').trim()
    
    let analysis
    try {
      analysis = JSON.parse(cleanText)
    } catch (parseError) {
      console.warn('⚠️ Failed to parse video JSON response, using fallback. Raw text:', cleanText)
      throw new Error(`Invalid JSON response: ${parseError}`)
    }
    
    return {
      performance_score: analysis.performance_score || Math.floor(Math.random() * 40) + 60,
      earnings: Math.max(5, Math.min(10, analysis.earnings || (Math.floor(Math.random() * 6) + 5))),
      feedback: analysis.feedback || "Great creativity! The family participation shows wonderful bonding.",
      creativity_level: analysis.creativity_level || 'good'
    }
    
  } catch (error) {
    console.error('❌ Gemini API video analysis error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      description,
      videoSize: videoBlob.size,
      videoType: videoBlob.type
    })
    
    // Enhanced fallback analysis
    const videoSize = videoBlob.size / (1024 * 1024) // MB
    const descriptionLength = description.length
    
    let performance = Math.random() * 0.4 + 0.5 // 50-90% base
    
    // Bonus for longer description (shows effort)
    if (descriptionLength > 50) performance += 0.1
    if (descriptionLength > 100) performance += 0.1
    
    // Bonus for reasonable video size (shows actual recording)
    if (videoSize > 0.5) performance += 0.1
    if (videoSize > 2) performance += 0.1
    
    performance = Math.min(performance, 1)
    
    const earnings = Math.floor(performance * 6) + 5 // $5-10
    const performanceScore = Math.round(performance * 100)
    
    const fallbackAnalysis: VideoAnalysis = {
      performance_score: performanceScore,
      earnings,
      feedback: `AI analysis temporarily unavailable. Based on video metrics (${Math.round(videoSize)}MB, ${descriptionLength} chars): ${performanceScore}% creativity score with great family bonding potential!`,
      creativity_level: performance > 0.8 ? 'amazing' : performance > 0.6 ? 'great' : performance > 0.4 ? 'good' : 'basic'
    }
    
    console.log('🔄 Using video fallback analysis:', fallbackAnalysis)
    return fallbackAnalysis
  }
}