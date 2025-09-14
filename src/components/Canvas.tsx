'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Download, Maximize2, RotateCcw, Image as ImageIcon, Video, Sparkles, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Grid3X3, Play, Pause } from 'lucide-react'
import { CanvasProps, CanvasContent } from '@/types/chat'

export default function Canvas({ content }: CanvasProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedContent = content[selectedIndex]

  const handleDownload = async (item: CanvasContent) => {
    if (item.url) {
      try {
        let downloadUrl = item.url
        let shouldCleanupUrl = false

        // Handle different URL types
        if (item.url.startsWith('blob:')) {
          // Blob URLs can be used directly
          downloadUrl = item.url
        } else if (item.url.startsWith('http') || item.url.startsWith('https')) {
          // External URLs - fetch and create blob
          console.log('Fetching external URL for download:', item.url)
          const response = await fetch(item.url, {
            mode: 'cors',
            credentials: 'omit'
          })
          
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`)
          }
          
          const blob = await response.blob()
          downloadUrl = URL.createObjectURL(blob)
          shouldCleanupUrl = true
        } else if (item.url.startsWith('data:')) {
          // Data URLs can be used directly
          downloadUrl = item.url
        }
        
        // Create download link
        const link = document.createElement('a')
        link.href = downloadUrl
        
        // Set appropriate file extension and name
        const extension = item.type === 'video' ? 'mp4' : 'png'
        const timestamp = item.timestamp.toISOString().replace(/[:.]/g, '-')
        link.download = `easy-video-${item.type}-${timestamp}.${extension}`
        
        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up blob URL if we created one
        if (shouldCleanupUrl) {
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
        }
        
        console.log('Download initiated successfully')
      } catch (error) {
        console.error('Error downloading file:', error)
        alert(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
      }
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

  const nextItem = () => {
    setSelectedIndex(prev => (prev + 1) % content.length)
  }

  const prevItem = () => {
    setSelectedIndex(prev => (prev - 1 + content.length) % content.length)
  }

  const selectItem = (index: number) => {
    setSelectedIndex(index)
    if (content.length > 0) {
      setViewMode('detail')
    }
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

  // Reset view mode when content changes
  useEffect(() => {
    if (content.length === 0) {
      setViewMode('grid')
      setSelectedIndex(0)
    } else if (content.length === 1) {
      setViewMode('detail')
      setSelectedIndex(0)
    }
  }, [content.length])

  if (content.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState />
      </div>
    )
  }

  // Grid View Mode
  if (viewMode === 'grid' && content.length > 1) {
    return (
      <div className="h-full overflow-auto custom-scrollbar">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Generated Content</h3>
            <p className="text-sm text-slate-600">{content.length} items</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => content.forEach(item => handleDownload(item))}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              title="Download all"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Download All</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item, index) => (
            <ContentThumbnail
              key={item.id}
              item={item}
              index={index}
              onSelect={() => selectItem(index)}
              onDownload={() => handleDownload(item)}
            />
          ))}
        </div>
      </div>
    )
  }

  // Detail View Mode
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
        {selectedContent && (
          selectedContent.type === 'image' ? (
            <Image
              src={selectedContent.url}
              alt={selectedContent.description || 'Generated image'}
              width={512}
              height={384}
              className={`w-96 h-72 object-contain rounded-lg shadow-lg ${isFullscreen ? '' : 'border border-slate-200'}`}
              unoptimized
            />
          ) : selectedContent.type === 'video' ? (
            <video
              key={selectedContent.url}
              src={selectedContent.url}
              controls
              className={`w-96 h-72 object-contain rounded-lg shadow-lg ${isFullscreen ? '' : 'border border-slate-200'}`}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              {...(selectedContent.url.startsWith('http') && !selectedContent.url.includes('localhost') ? { crossOrigin: 'anonymous' } : {})}
              onError={(e) => {
                console.error('Video loading error:', e);
                console.log('Video URL:', selectedContent.url);
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : null
        )}
      </div>

      {/* Navigation Controls */}
      {content.length > 1 && !isFullscreen && (
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <button
            onClick={() => setViewMode('grid')}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={prevItem}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Previous item"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-1.5 text-xs font-medium bg-white/20 rounded">
              {selectedIndex + 1} / {content.length}
            </span>
            <button
              onClick={nextItem}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Next item"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Zoom and Action Controls */}
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
        {selectedContent && (
          <button
            onClick={() => handleDownload(selectedContent)}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content Info */}
      {selectedContent && selectedContent.description && (
        <div className={`absolute bottom-4 left-4 right-4 z-10 ${isFullscreen ? 'text-white' : ''}`}>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              {selectedContent.type === 'image' ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              <span className="text-sm font-medium capitalize">{selectedContent.type}</span>
              <span className="text-xs opacity-70">
                {selectedContent.timestamp.toLocaleString()}
              </span>
            </div>
            <p className="text-sm opacity-90">{selectedContent.description}</p>
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

function ContentThumbnail({ 
  item, 
  index, 
  onSelect, 
  onDownload 
}: { 
  item: CanvasContent
  index: number
  onSelect: () => void
  onDownload: () => void
}) {
  return (
    <div className="group relative bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Thumbnail */}
      <div 
        className="aspect-video bg-slate-100 cursor-pointer relative overflow-hidden"
        onClick={onSelect}
      >
        {item.type === 'image' ? (
          <Image
            src={item.url}
            alt={item.description}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            unoptimized
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              src={item.url}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-slate-700 ml-1" />
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay with type indicator */}
        <div className="absolute top-2 left-2">
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            {item.type === 'image' ? (
              <ImageIcon className="w-3 h-3" />
            ) : (
              <Video className="w-3 h-3" />
            )}
            {item.type}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-medium">
            View Details
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-800 truncate flex-1">
            {item.description}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDownload()
            }}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {item.timestamp.toLocaleString()}
        </p>
      </div>
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
          <span className="text-sm">Videos from text prompts and previous images</span>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <p className="text-sm text-slate-600">
          <strong>Examples:</strong> &quot;Create an image of a futuristic city at sunset&quot; or &quot;Generate a video of ocean waves&quot;
        </p>
        <p className="text-xs text-slate-500 mt-2">
          💡 <strong>Tip:</strong> Generate images first, then create videos! The video generator will automatically use your previous images as context for more cohesive content.
        </p>
      </div>
    </div>
  )
}
