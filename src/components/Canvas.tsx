'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Download, Maximize2, RotateCcw, Image as ImageIcon, Video, Sparkles } from 'lucide-react'
import { CanvasProps } from '@/types/chat'

export default function Canvas({ content }: CanvasProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleDownload = () => {
    if (content.url) {
      const link = document.createElement('a')
      link.href = content.url
      link.download = `easy-video-${content.type}-${Date.now()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!content.url) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className={`relative h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center' : ''}`}>
      {/* Content Display */}
      <div className={`relative ${isFullscreen ? 'max-w-screen-lg max-h-screen' : 'w-full h-full'} flex items-center justify-center`}>
        {content.type === 'image' ? (
          <Image
            src={content.url}
            alt={content.description || 'Generated image'}
            width={1024}
            height={768}
            className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${isFullscreen ? '' : 'border border-slate-200'}`}
            unoptimized
          />
        ) : content.type === 'video' ? (
          <video
            src={content.url}
            controls
            className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${isFullscreen ? '' : 'border border-slate-200'}`}
            autoPlay
            loop
          >
            Your browser does not support the video tag.
          </video>
        ) : null}

        {/* Overlay Controls */}
        <div className={`absolute top-4 right-4 flex gap-2 ${isFullscreen ? 'text-white' : ''}`}>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Content Info */}
        {content.description && (
          <div className={`absolute bottom-4 left-4 right-4 ${isFullscreen ? 'text-white' : ''}`}>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                {content.type === 'image' ? (
                  <ImageIcon className="w-4 h-4" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                <span className="text-sm font-medium capitalize">{content.type}</span>
              </div>
              <p className="text-sm opacity-90">{content.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Close button for fullscreen */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 text-white p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
          title="Exit fullscreen"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-blue-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        Ready to Create
      </h3>
      
      <p className="text-slate-600 mb-6 leading-relaxed">
        Use the chat sidebar to describe what you want to create. I can generate:
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-slate-700">
          <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-sm">Images from text descriptions</span>
        </div>
        
        <div className="flex items-center gap-3 text-slate-700">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Video className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm">Videos from text and images</span>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <p className="text-sm text-slate-600">
          <strong>Example:</strong> &quot;Create an image of a futuristic city at sunset&quot; or &quot;Generate a video of ocean waves&quot;
        </p>
      </div>
    </div>
  )
}
