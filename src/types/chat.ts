export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  generatedContent?: {
    type: 'image' | 'video'
    url: string
    description: string
  }
}

export interface ChatSidebarProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading: boolean
}

export interface CanvasContent {
  type: 'image' | 'video'
  url: string
  description: string
  id: string
  timestamp: Date
}

export interface CanvasProps {
  content: CanvasContent[]
}

export interface GenerateVideoRequest {
  prompt: string
  images?: CanvasContent[]
}

export interface GenerateImageRequest {
  prompt: string
}

export interface RequestBody {
  prompt: string
  images?: CanvasContent[]
}
