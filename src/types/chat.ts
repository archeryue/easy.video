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

export interface CanvasProps {
  content: {
    type: 'image' | 'video' | null
    url: string | null
    description: string | null
  }
}
