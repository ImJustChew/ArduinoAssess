#!/bin/bash
# ArduinoAssess Setup Script

echo "🚀 ArduinoAssess Setup"
echo "====================="
echo ""

# Check for Bun
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed"
    echo "   Install from: https://bun.sh"
    exit 1
fi
echo "✅ Bun is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
bun install

# Check for .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  No .env file found"
    echo "   Copying .env.example to .env..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit .env and add your:"
    echo "   - DATABASE_URL (from Neon)"
    echo "   - ANTHROPIC_API_KEY"
    echo ""
    echo "   Then run: bun run server/db/init.ts"
else
    echo "✅ .env file exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file"
echo "2. Run: bun run server/db/init.ts"
echo "3. Run: bun run dev"
echo "4. Visit http://localhost:3000"
