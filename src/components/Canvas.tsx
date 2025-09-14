'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Download, Maximize2, RotateCcw, Image as ImageIcon, Video, Sparkles, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { CanvasProps } from '@/types/chat'

export default function Canvas({ content }: CanvasProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5)) // Max zoom 5x
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1)) // Min zoom 0.1x
  }

  const handleZoomReset = () => {
    setZoom(1)
  }

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5))
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  if (!content.url) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState />
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative h-full overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center' : ''}`}
    >
      {/* Content Display */}
      <div 
        className={`relative ${isFullscreen ? 'max-w-screen-lg max-h-screen' : 'w-full h-full'} flex items-center justify-center transition-transform duration-200 ease-out`}
        style={{ transform: `scale(${zoom})` }}
      >
        {content.type === 'image' ? (
          <Image
            src={content.url}
            alt={content.description || 'Generated image'}
            width={512}
            height={384}
            className={`w-96 h-72 object-contain rounded-lg shadow-lg ${isFullscreen ? '' : 'border border-slate-200'}`}
            unoptimized
          />
        ) : content.type === 'video' ? (
          <video
            src={content.url}
            controls
            className={`w-96 h-72 object-contain rounded-lg shadow-lg ${isFullscreen ? '' : 'border border-slate-200'}`}
            autoPlay
            loop
          >
            Your browser does not support the video tag.
          </video>
        ) : null}
      </div>

      {/* Overlay Controls - Outside scaled container */}
      <div className={`absolute top-4 right-4 flex gap-2 z-10 ${isFullscreen ? 'text-white' : ''}`}>
        <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="Zoom out (Ctrl + scroll)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1.5 hover:bg-white/20 rounded transition-colors text-xs font-medium"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="Zoom in (Ctrl + scroll)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
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
        <div className={`absolute bottom-4 left-4 right-4 z-10 ${isFullscreen ? 'text-white' : ''}`}>
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

      {/* Close button for fullscreen */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 text-white p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors z-10"
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
