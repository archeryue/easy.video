import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.GOOGLE_API_KEY || 'mock-api-key-for-testing'
const IS_MOCK = API_KEY === 'mock-api-key-for-testing'

// Initialize with mock or real API key
const genAI = IS_MOCK ? null : new GoogleGenerativeAI(API_KEY)

// Text generation model (only if not mocking)
export const textModel = IS_MOCK ? null : genAI?.getGenerativeModel({ model: 'gemini-pro' })

// Image generation model (only if not mocking)
export const imageModel = IS_MOCK ? null : genAI?.getGenerativeModel({ model: 'gemini-pro-vision' })

export interface GenerateImageResponse {
  url: string
  description: string
}

export interface GenerateVideoResponse {
  url: string
  description: string
}

export async function generateImagePrompt(userPrompt: string): Promise<string> {
  if (IS_MOCK) {
    // Mock response for testing
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    return `Enhanced: ${userPrompt} - A high-quality, detailed image with professional composition, vibrant colors, and artistic lighting.`
  }

  try {
    const prompt = `You are an expert at creating detailed image generation prompts. 
    Convert this user request into a detailed, specific prompt for image generation:
    
    User request: "${userPrompt}"
    
    Create a detailed prompt that includes:
    - Visual style and aesthetic
    - Composition and framing
    - Lighting and colors
    - Any relevant artistic techniques
    - High quality descriptors
    
    Keep it concise but descriptive. Respond with just the enhanced prompt.`

    const result = await textModel!.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating image prompt:', error)
    return userPrompt // Fallback to original prompt
  }
}

export async function generateVideoPrompt(userPrompt: string): Promise<string> {
  if (IS_MOCK) {
    // Mock response for testing
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    return `Enhanced: ${userPrompt} - A cinematic video with smooth camera movements, dynamic scenes, and engaging visual storytelling.`
  }

  try {
    const prompt = `You are an expert at creating detailed video generation prompts.
    Convert this user request into a detailed, specific prompt for video generation:
    
    User request: "${userPrompt}"
    
    Create a detailed prompt that includes:
    - Scene description and setting
    - Camera movements and angles
    - Animation style and motion
    - Duration suggestions
    - Visual effects and transitions
    - Mood and atmosphere
    
    Keep it concise but descriptive. Respond with just the enhanced prompt.`

    const result = await textModel!.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating video prompt:', error)
    return userPrompt // Fallback to original prompt
  }
}

// Mock/placeholder functions for image/video generation
export async function generateImage(prompt: string): Promise<GenerateImageResponse> {
  console.log('🎨 Generating image for prompt:', prompt)
  
  // Create a more realistic placeholder image URL
  const imageIds = [1015, 1018, 1019, 1020, 1025, 1035, 1040, 1043, 1050, 1055]
  const randomId = imageIds[Math.floor(Math.random() * imageIds.length)]
  const placeholderUrl = `https://picsum.photos/1024/768?random=${randomId}&t=${Date.now()}`
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
  
  return {
    url: placeholderUrl,
    description: prompt
  }
}

export async function generateVideo(prompt: string): Promise<GenerateVideoResponse> {
  console.log('🎬 Generating video for prompt:', prompt)
  
  // Use different sample videos for variety
  const sampleVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  ]
  
  const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)]
  
  // Simulate longer API delay for video generation
  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000))
  
  return {
    url: randomVideo,
    description: prompt
  }
}

export async function enhancePromptWithGemini(
  userPrompt: string, 
  type: 'image' | 'video'
): Promise<string> {
  if (IS_MOCK) {
    // Mock enhancement for testing
    await new Promise(resolve => setTimeout(resolve, 300))
    return type === 'image' 
      ? await generateImagePrompt(userPrompt)
      : await generateVideoPrompt(userPrompt)
  }

  try {
    const systemPrompt = type === 'image' 
      ? `Enhance this prompt for image generation. Make it more detailed and specific for creating high-quality images. Focus on visual elements, style, composition, and aesthetics:`
      : `Enhance this prompt for video generation. Make it more detailed and specific for creating engaging videos. Focus on movement, scenes, transitions, and cinematic elements:`

    const result = await textModel!.generateContent(`${systemPrompt}\n\nUser prompt: "${userPrompt}"\n\nEnhanced prompt:`)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error enhancing prompt:', error)
    return userPrompt
  }
}
