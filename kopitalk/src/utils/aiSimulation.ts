// Simulates Gemini API analysis of audio recordings
export async function analyzeAudioConversation(audioBlob: Blob): Promise<{ quality: number; movement: number; earnings: number; feedback: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate analysis results based on audio duration and "quality"
  const duration = audioBlob.size / 1000 // Rough estimate
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
  
  return {
    quality: Math.round(quality * 100),
    movement,
    earnings,
    feedback: feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
  }
}

// Simulates Gemini API analysis of TikTok videos
export async function analyzeTikTokVideo(videoBlob: Blob, trendDescription: string): Promise<{ earnings: number; feedback: string; performance_score: number }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Simulate analysis based on video size and description length
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
  
  return {
    earnings,
    performance_score: performanceScore,
    feedback: feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
  }
}