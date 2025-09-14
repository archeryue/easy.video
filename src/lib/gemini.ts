import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GOOGLE_API_KEY || 'mock-api-key-for-testing'
const IS_MOCK = API_KEY === 'mock-api-key-for-testing'

const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Model constants
const GEMINI_TEXT_MODEL = "gemini-2.0-flash-exp";
const GEMINI_IMAGE_MODEL = "imagen-4.0-generate-001"; // Placeholder for future image model
const GEMINI_VIDEO_MODEL = "veo-3.0-generate-001"; // Placeholder for future video model

export interface GenerateImageResponse {
  url: string
  description: string
}

export interface GenerateVideoResponse {
  url: string
  description: string
}

// Core Gemini API function for text generation
export async function callGeminiTextAPI(prompt: string, model: string = GEMINI_TEXT_MODEL): Promise<string> {
  try {
    const result = await genAI.models.generateContent({
      model: model,
      contents: prompt,
    });
    return result.text || prompt
  } catch (error) {
    console.error('Error calling Gemini text API:', error)
    return prompt // Fallback to original prompt
  }
}

// Core Gemini API function for image generation (placeholder)
export async function callGeminiImageAPI(prompt: string, model: string = GEMINI_IMAGE_MODEL): Promise<{ url: string; description: string }> {
  try {
    const result = await genAI.models.generateImages({
      model: model,
      prompt: prompt,
    });
    
    if (result.generatedImages && result.generatedImages.length > 0) {
      const generatedImage = result.generatedImages[0]; // Get the first generated image
      
      if (generatedImage.image && generatedImage.image.imageBytes) {
        const imgBytes = generatedImage.image.imageBytes;
        
        // Convert base64 image bytes to data URL for Canvas display
        const dataUrl = `data:image/png;base64,${imgBytes}`;
        
        return {
          url: dataUrl,
          description: prompt
        };
      } else {
        throw new Error('Generated image data is invalid');
      }
    } else {
      throw new Error('No images generated');
    }
  } catch (error) {
    console.error('Error calling Gemini image API:', error)
    throw error; // Re-throw to be handled by the calling function
  }
}

// Core Gemini API function for video generation (placeholder)
export async function callGeminiVideoAPI(prompt: string, model: string = GEMINI_VIDEO_MODEL): Promise<{ url: string; description: string }> {
  try {
    let operation = await genAI.models.generateVideos({
      model: model,
      prompt: prompt,
    });
    
    // Poll the operation status until the video is ready.
    while (!operation.done) {
      console.log("Waiting for video generation to complete...")
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await genAI.operations.getVideosOperation({
        operation: operation,
      });
    }

    // Check if the operation completed successfully and has generated videos
    if (!operation.response || !operation.response.generatedVideos || operation.response.generatedVideos.length === 0) {
      throw new Error('No videos were generated in the operation response');
    }

    const generatedVideo = operation.response.generatedVideos[0];
    if (!generatedVideo.video) {
      throw new Error('Generated video data is missing');
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `generated_video_${timestamp}.mp4`;
    const downloadPath = `public/videos/${filename}`;

    await genAI.files.download({
      file: generatedVideo.video,
      downloadPath: downloadPath,
    });
    console.log(`Generated video saved to ${downloadPath}`);

    // Return the local video URL and description
    return {
      url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/videos/${filename}`, // Full URL path
      description: prompt
    };

  } catch (error) {
    console.error('Error calling Gemini video API:', error)
    throw error; // Re-throw to be handled by the calling function
  }
}

export async function generateImagePrompt(userPrompt: string): Promise<string> {
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

  return await callGeminiTextAPI(prompt, GEMINI_TEXT_MODEL)
}

export async function generateVideoPrompt(userPrompt: string): Promise<string> {
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

  return await callGeminiTextAPI(prompt, GEMINI_TEXT_MODEL)
}

export async function generateImage(prompt: string): Promise<GenerateImageResponse> {
  console.log('🎨 Generating image for prompt:', prompt)
  
  try {
    const result = await callGeminiImageAPI(prompt, GEMINI_IMAGE_MODEL)
    return result
  } catch (error) {
    console.error('Error generating image with Gemini:', error)
    
    // Fallback to mock image in case of error
    const imageIds = [1015, 1018, 1019, 1020, 1025, 1035, 1040, 1043, 1050, 1055]
    const randomId = imageIds[Math.floor(Math.random() * imageIds.length)]
    const placeholderUrl = `https://picsum.photos/1024/768?random=${randomId}&t=${Date.now()}`
    
    return {
      url: placeholderUrl,
      description: `Error generating image. Showing placeholder.`
    }
  }
}

export async function generateVideo(prompt: string): Promise<GenerateVideoResponse> {
  console.log('🎬 Generating video for prompt:', prompt)
  
  try {
    const result = await callGeminiVideoAPI(prompt, GEMINI_VIDEO_MODEL)
    console.log('✅ Video generation successful:', {
      hasUrl: !!result.url,
      urlType: typeof result.url,
      urlStart: result.url ? result.url.slice(0, 50) + '...' : 'none',
      isBlobUrl: result.url?.startsWith('blob:'),
      isHttpUrl: result.url?.startsWith('http')
    })
    return result
  } catch (error) {
    console.error('❌ Error generating video with Gemini:', error)
    console.log('🔄 Falling back to sample video...')
    
    // Fallback to sample video in case of error - using shorter videos for better performance
    const sampleVideos = [
      'http://localhost:3000/videos/generated_video_1757842104402.mp4',
      'http://localhost:3000/videos/generated_video_1757842736723.mp4',
      'http://localhost:3000/videos/generated_video_1757843018326.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ]
    
    const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)]
    console.log('📹 Using fallback video:', randomVideo)
    
    return {
      url: randomVideo,
      description: `Generated fallback video for: ${prompt}`
    }
  }
}

// Function to analyze user intent and determine if they want image or video generation
export async function analyzePromptIntent(userPrompt: string): Promise<'image' | 'video'> {
  const prompt = `You are an AI assistant that analyzes user prompts to determine if they want to generate an image or a video.

User prompt: "${userPrompt}"

Analyze this prompt and respond with ONLY "image" or "video" based on what the user is asking for.

Guidelines:
- If the user mentions motion, animation, movement, sequences, clips, videos, movies, films, or time-based content, respond with "video"
- If the user mentions static visuals, pictures, photos, illustrations, artwork, or single-frame content, respond with "image"
- If the prompt is ambiguous, consider what would be most natural - for example, scenes with action or movement suggest video, while descriptive scenes of objects or places suggest images
- Pay attention to verbs that suggest motion (flowing, moving, dancing, running, etc.) which indicate video

Respond with exactly one word: either "image" or "video"`

  try {
    const result = await callGeminiTextAPI(prompt, GEMINI_TEXT_MODEL)
    const cleanResult = result.toLowerCase().trim()
    
    // Validate the response and default to image if unclear
    if (cleanResult.includes('video')) {
      return 'video'
    } else if (cleanResult.includes('image')) {
      return 'image'
    } else {
      // Default to image if the response is unclear
      console.warn('Unclear intent analysis result:', result, 'defaulting to image')
      return 'image'
    }
  } catch (error) {
    console.error('Error analyzing prompt intent:', error)
    // Fallback to simple keyword detection
    const videoKeywords = ['video', 'animation', 'movie', 'film', 'animate', 'motion', 'moving']
    const lowerPrompt = userPrompt.toLowerCase()
    const hasVideoKeyword = videoKeywords.some(keyword => lowerPrompt.includes(keyword))
    return hasVideoKeyword ? 'video' : 'image'
  }
}

export async function enhancePromptWithGemini(
  userPrompt: string, 
  type: 'image' | 'video'
): Promise<string> {
  return type === 'image' 
    ? await generateImagePrompt(userPrompt)
    : await generateVideoPrompt(userPrompt)
}
