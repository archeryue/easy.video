# Easy Video - AI Video Creation Agent

A modern web application built with Next.js that allows users to create images and videos using natural language powered by Google Gemini AI.

## Features

- 🎨 **AI Image Generation**: Create stunning images from text descriptions
- 🎬 **AI Video Generation**: Generate videos from text prompts and images
- 💬 **Intelligent Chat Interface**: Natural language interaction with AI
- 🖼️ **Multi-Content Canvas**: View multiple images and videos in grid or detail view, with zoom, navigation, and batch download capabilities
- 🚀 **Cloud Ready**: Optimized for Google Cloud Run deployment
- 📱 **Responsive Design**: Beautiful UI that works on all devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API
- **Deployment**: Google Cloud Run with Docker
- **Icons**: Lucide React

## Prerequisites

- Node.js 18 or higher
- Google Cloud account with Gemini API access
- Docker (for deployment)

## Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd easy.video
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a \`.env.local\` file in the root directory:

\`\`\`env
GOOGLE_API_KEY=your_google_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

To get your Google Gemini API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your environment file

> **Note**: This application uses Google's Imagen model for image generation through the Gemini API.

### 4. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Start a Conversation**: Use the chat sidebar to describe what you want to create
2. **Generate Images**: Type descriptions like "Create an image of a sunset over mountains"
3. **Generate Videos**: Use keywords like "video" or "animation" in your prompts
4. **View Results**: Generated content appears on the main canvas
5. **Multi-Content Support**: Generate multiple images and videos - they'll all be saved in the canvas
6. **Grid View**: When you have multiple items, use the grid view to see all your creations at once
7. **Detail View**: Click on any item to view it in detail with zoom and navigation controls
8. **Download Content**: Download individual items or use "Download All" to get everything at once

### Example Prompts

**For Images:**
- "Create an image of a futuristic city at sunset"
- "Generate a photo of a cat wearing sunglasses"
- "Paint a landscape with rolling hills and wildflowers"

**For Videos:**
- "Create a video of ocean waves crashing on rocks"
- "Generate an animation of a rocket launching into space"
- "Make a video of falling autumn leaves"

## Deployment to Google Cloud Run

### 1. Build and Push Docker Image

\`\`\`bash
# Build the Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/easy-video .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/easy-video
\`\`\`

### 2. Deploy to Cloud Run

\`\`\`bash
gcloud run deploy easy-video \\
  --image gcr.io/YOUR_PROJECT_ID/easy-video \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars GOOGLE_API_KEY=your_api_key_here
\`\`\`

### 3. Using Cloud Build (Recommended)

Create a \`cloudbuild.yaml\` file:

\`\`\`yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/easy-video', '.']
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/easy-video']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'easy-video'
      - '--image'
      - 'gcr.io/$PROJECT_ID/easy-video'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/easy-video'
\`\`\`

Deploy using Cloud Build:

\`\`\`bash
gcloud builds submit --config cloudbuild.yaml
\`\`\`

## API Endpoints

- \`POST /api/generate-image\` - Generate images from text
- \`POST /api/generate-video\` - Generate videos from text
- \`POST /api/chat\` - Chat with the AI assistant

## Development

### Project Structure

\`\`\`
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── components/
│   ├── Canvas.tsx     # Content display canvas
│   └── ChatSidebar.tsx # Chat interface
├── lib/
│   └── gemini.ts      # Gemini AI integration
└── types/
    └── chat.ts        # TypeScript types
\`\`\`

### Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`GOOGLE_API_KEY\` | Google Gemini API key for text and image generation | Yes |
| \`NEXT_PUBLIC_APP_URL\` | Application URL | No |

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Acknowledgments

- Google Gemini AI for powering the content generation
- Next.js team for the amazing framework
- Tailwind CSS for the styling system
- Lucide for the beautiful icons