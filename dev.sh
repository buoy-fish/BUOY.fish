#!/bin/bash
# BUOY.fish Website Development Startup Script
#
# This script:
# 1. Checks for Node.js and npm
# 2. Installs dependencies if needed
# 3. Sets up local environment
# 4. Starts the Vite dev server
#
# Usage: ./dev.sh [--clean|--kill|--help]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Starting BUOY.fish Website Development Environment"
echo "═══════════════════════════════════════════════════════"

# Parse arguments
for arg in "$@"; do
    case $arg in
        --clean)
            echo -e "\n${YELLOW}🧹 Cleaning build artifacts...${NC}"
            rm -rf node_modules .svelte-kit
            echo "   ✅ Removed node_modules and .svelte-kit"
            echo ""
            ;;
        --kill)
            echo "🛑 Killing development server..."
            lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "   ✅ Port 5173 freed" || echo "   ℹ️  No dev server running on port 5173"
            exit 0
            ;;
        --help|-h)
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --clean     Remove node_modules and .svelte-kit before starting"
            echo "  --kill      Kill any running dev server on port 5173"
            echo "  --help, -h  Show this help message"
            echo ""
            exit 0
            ;;
    esac
done

# Check prerequisites
echo -e "\n📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "   ${RED}❌ Node.js not found${NC}"
    echo "   Please install Node.js: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "   ✅ Node.js ${NODE_VERSION}"

if ! command -v npm &> /dev/null; then
    echo -e "   ${RED}❌ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo "   ✅ npm ${NPM_VERSION}"

# Set up environment
echo -e "\n📋 Setting up environment..."
if [ -f ".env.local" ]; then
    cp .env.local .env
    echo "   ✅ Copied .env.local → .env"
elif [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "   ${YELLOW}⚠️  Copied .env.example → .env (update with your credentials)${NC}"
else
    echo -e "   ${YELLOW}⚠️  No .env.local or .env.example found, skipping .env setup${NC}"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo "   ✅ Dependencies installed"
else
    echo -e "\n   ✅ Dependencies already installed"
fi

# Start dev server
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🌊 BUOY.fish dev server starting...${NC}"
echo -e "${GREEN}   Local:   http://localhost:5173/${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

npm run dev
