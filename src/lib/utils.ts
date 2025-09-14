import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  }
  
  return date.toLocaleDateString()
}

export function isVideoRequest(prompt: string): boolean {
  const videoKeywords = [
    'video', 'animation', 'movie', 'film', 'animate', 'motion', 'moving',
    'sequence', 'clip', 'footage', 'cinematic', 'dynamic', 'flowing'
  ]
  
  const lowerPrompt = prompt.toLowerCase()
  return videoKeywords.some(keyword => lowerPrompt.includes(keyword))
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
