import { NextRequest, NextResponse } from 'next/server'
import { generateVideo, enhancePromptWithGemini } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Enhance the prompt using Gemini
    const enhancedPrompt = await enhancePromptWithGemini(prompt, 'video')
    
    // Generate the video
    const result = await generateVideo(enhancedPrompt)

    return NextResponse.json({
      url: result.url,
      description: result.description,
      enhancedPrompt,
      originalPrompt: prompt
    })
  } catch (error) {
    console.error('Error in generate-video API:', error)
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    )
  }
}
