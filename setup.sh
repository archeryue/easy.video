#!/bin/bash

echo "🚀 Setting up Easy Video - AI Video Creation Agent"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local and add your Google API key"
else
    echo "✅ .env.local file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your Google Gemini API key"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For deployment to Google Cloud Run:"
echo "1. Build: docker build -t gcr.io/YOUR_PROJECT_ID/easy-video ."
echo "2. Push: docker push gcr.io/YOUR_PROJECT_ID/easy-video"
echo "3. Deploy: gcloud run deploy easy-video --image gcr.io/YOUR_PROJECT_ID/easy-video"
echo ""
echo "Happy creating! 🎬✨"
