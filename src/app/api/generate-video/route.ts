import { NextRequest, NextResponse } from 'next/server'
import { generateVideoWithImages, enhanceVideoPromptWithImages } from '@/lib/gemini'
import { CanvasContent } from '@/types/chat'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, images } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Filter for image content only
    const imageContent: CanvasContent[] = (images || []).filter((item: CanvasContent) => item.type === 'image')
    
    // Enhance the prompt using Gemini, incorporating image context if available
    const enhancedPrompt = await enhanceVideoPromptWithImages(prompt, imageContent)
    
    // Generate the video with images
    const result = await generateVideoWithImages(enhancedPrompt, imageContent)

    return NextResponse.json({
      url: result.url,
      description: result.description,
      enhancedPrompt,
      originalPrompt: prompt,
      usedImages: imageContent.length
    })
  } catch (error) {
    console.error('Error in generate-video API:', error)
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    )
  }
}
