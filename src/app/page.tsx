'use client'

import React, { useState } from 'react'
import ChatSidebar from '@/components/ChatSidebar'
import Canvas from '@/components/Canvas'
import { Message, CanvasContent, RequestBody } from '@/types/chat'
import { generateUniqueId } from '@/lib/utils'

// Note: Automatic video download functionality has been removed
// Users can now manually download content using the Canvas download buttons

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to Easy Video! I can help you create images and videos using natural language. Try saying something like "Create an image of a sunset over mountains" or "Generate a video of a cat playing with a ball".',
      role: 'assistant',
      timestamp: new Date(),
    },
  ])
  const [canvasContent, setCanvasContent] = useState<CanvasContent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: generateUniqueId(),
      content,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Use server-side API to analyze the user's prompt and determine intent
      console.log('🤔 Analyzing user prompt:', content)
      const intentResponse = await fetch('/api/analyze-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: content }),
      })
      
      if (!intentResponse.ok) {
        throw new Error('Failed to analyze intent')
      }
      
      const intentData = await intentResponse.json()
      const contentType = intentData.intent
      console.log('✅ Intent analysis result:', contentType)
      const isVideo = contentType === 'video'
      
      const endpoint = isVideo ? '/api/generate-video' : '/api/generate-image'
      
      // Prepare request payload
      const requestBody: RequestBody = { prompt: content }
      
      // If it's a video request, include available images for context
      if (isVideo) {
        const availableImages = canvasContent.filter(item => item.type === 'image')
        requestBody.images = availableImages
        console.log('🖼️ Including', availableImages.length, 'images for video generation context')
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      
      console.log('📤 API Response received:', { 
        type: isVideo ? 'video' : 'image', 
        hasUrl: !!data.url,
        urlType: data.url ? (data.url.startsWith('blob:') ? 'blob' : data.url.startsWith('http') ? 'http' : 'other') : 'none'
      });
      
      // Create new canvas content item
      const newContent: CanvasContent = {
        id: generateUniqueId(),
        type: isVideo ? 'video' : 'image',
        url: data.url,
        description: content,
        timestamp: new Date(),
      }
      
      // Add to canvas content array
      setCanvasContent(prev => [...prev, newContent])

      // Note: Automatic video download has been removed for better user experience
      // Users can manually download videos using the download button in the canvas

      const assistantMessage: Message = {
        id: generateUniqueId(),
        content: `I've generated a ${isVideo ? 'video' : 'image'} for you: "${content}". ${
          isVideo && data.usedImages > 0 
            ? `This video was created using context from ${data.usedImages} previously generated image${data.usedImages > 1 ? 's' : ''}. ` 
            : ''
        }You can see it on the canvas! Use the download button to save it to your computer.`,
        role: 'assistant',
        timestamp: new Date(),
        generatedContent: {
          type: isVideo ? 'video' : 'image',
          url: data.url,
          description: content,
        },
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating content:', error)
      const errorMessage: Message = {
        id: generateUniqueId(),
        content: 'Sorry, I encountered an error while generating your content. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main Canvas Area */}
      <div className="flex-1 p-6">
        <div className="h-full bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h1 className="text-2xl font-bold text-slate-800">Easy Video Canvas</h1>
            </div>
            <div className="flex-1 p-6">
              <Canvas content={canvasContent} />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-96 p-6 pl-0">
        <ChatSidebar
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
