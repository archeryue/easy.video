import { NextRequest, NextResponse } from 'next/server'
import { analyzePromptIntent } from '@/lib/gemini'

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

    console.log('🤔 API: Analyzing intent for prompt:', prompt)
    const intent = await analyzePromptIntent(prompt)
    console.log('✅ API: Intent determined:', intent)

    return NextResponse.json({
      intent,
      prompt
    })
  } catch (error) {
    console.error('❌ Error in analyze-intent API:', error)
    
    // Fallback to conservative detection
    const lowerPrompt = (typeof error === 'object' && error !== null && 'prompt' in error 
      ? String((error as any).prompt) 
      : String(request.body || '')).toLowerCase()
      
    const hasVideoKeyword = ['video', 'animation', 'movie', 'film', '视频', '动画', '电影'].some(
      keyword => lowerPrompt.includes(keyword)
    )
    
    const fallbackIntent = hasVideoKeyword ? 'video' : 'image'
    console.log('🔄 API: Fallback intent:', fallbackIntent)
    
    return NextResponse.json({
      intent: fallbackIntent,
      prompt: request.body,
      fallback: true
    })
  }
}
