'use client'

import React, { useState } from 'react'
import ChatSidebar from '@/components/ChatSidebar'
import Canvas from '@/components/Canvas'
import { Message } from '@/types/chat'
import { isVideoRequest, generateUniqueId } from '@/lib/utils'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to Easy Video! I can help you create images and videos using natural language. Try saying something like "Create an image of a sunset over mountains" or "Generate a video of a cat playing with a ball".',
      role: 'assistant',
      timestamp: new Date(),
    },
  ])
  const [canvasContent, setCanvasContent] = useState<{
    type: 'image' | 'video' | null
    url: string | null
    description: string | null
  }>({
    type: null,
    url: null,
    description: null,
  })
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
      // Determine if user wants image or video generation
      const isVideo = isVideoRequest(content)
      
      const endpoint = isVideo ? '/api/generate-video' : '/api/generate-image'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: content }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      
      // Update canvas with generated content
      setCanvasContent({
        type: isVideo ? 'video' : 'image',
        url: data.url,
        description: content,
      })

      const assistantMessage: Message = {
        id: generateUniqueId(),
        content: `I've generated a ${isVideo ? 'video' : 'image'} for you: "${content}". You can see it on the canvas!`,
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
              <p className="text-slate-600 mt-1">Your AI-generated content will appear here</p>
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
