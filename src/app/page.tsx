'use client'

import React, { useState } from 'react'
import ChatSidebar from '@/components/ChatSidebar'
import Canvas from '@/components/Canvas'
import { Message } from '@/types/chat'
import { generateUniqueId } from '@/lib/utils'
import { analyzePromptIntent } from '@/lib/gemini'

// Function to download video file
const downloadVideoFile = async (url: string, description: string) => {
  try {
    console.log('🔄 Starting video download from URL:', url);
    
    let downloadUrl = url;
    let shouldCleanupUrl = false;

    // Handle different URL types for download
    if (url.startsWith('blob:')) {
      // Blob URLs can be used directly
      console.log('📦 Using blob URL directly');
      downloadUrl = url;
    } else if (url.startsWith('http') || url.startsWith('https')) {
      // External URLs - fetch and create blob
      console.log('🌐 Fetching external URL for download');
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('📁 Created blob from response, size:', blob.size, 'bytes');
      downloadUrl = URL.createObjectURL(blob);
      shouldCleanupUrl = true;
    } else if (url.startsWith('data:')) {
      // Data URLs can be used directly
      console.log('📊 Using data URL directly');
      downloadUrl = url;
    }
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `easy-video-${timestamp}.mp4`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Video download initiated successfully');
    
    // Clean up blob URL if we created one
    if (shouldCleanupUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
        console.log('🧹 Cleaned up blob URL');
      }, 2000);
    }
    
  } catch (error) {
    console.error('❌ Error downloading video file:', error);
    // Don't alert here as it might interrupt the user experience
    console.log('💡 Video download failed, but video should still be viewable in canvas');
  }
};

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
      // Use Gemini to intelligently analyze the user's prompt and determine intent
      const contentType = await analyzePromptIntent(content)
      const isVideo = contentType === 'video'
      
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
      
      console.log('📤 API Response received:', { 
        type: isVideo ? 'video' : 'image', 
        hasUrl: !!data.url,
        urlType: data.url ? (data.url.startsWith('blob:') ? 'blob' : data.url.startsWith('http') ? 'http' : 'other') : 'none'
      });
      
      // Update canvas with generated content
      setCanvasContent({
        type: isVideo ? 'video' : 'image',
        url: data.url,
        description: content,
      })

      // Automatically download video file immediately if it's a video
      if (isVideo && data.url) {
        console.log('🎬 Video generated, initiating automatic download...');
        // Start download immediately without delay
        downloadVideoFile(data.url, content).catch(error => {
          console.error('❌ Auto-download failed:', error);
        });
      }

      const assistantMessage: Message = {
        id: generateUniqueId(),
        content: `I've generated a ${isVideo ? 'video' : 'image'} for you: "${content}". You can see it on the canvas!${isVideo ? ' The video file will be automatically downloaded to your computer.' : ''}`,
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
