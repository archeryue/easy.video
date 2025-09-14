import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, prompt } = body

    if (!prompt && !messages) {
      return NextResponse.json(
        { error: 'Prompt or messages are required' },
        { status: 400 }
      )
    }

    const userMessage = prompt || messages[messages.length - 1]?.content

    // Mock response for testing - replace with actual Gemini API when ready
    const mockResponses = [
      "I'd be happy to help you create that! Let me generate it for you.",
      "Great idea! I'll work on creating that content now.",
      "That sounds amazing! I'll generate that for you right away.",
      "Excellent request! Let me create that content for you.",
      "I love that concept! I'll get started on generating it now."
    ]

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    return NextResponse.json({
      message: randomResponse,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
