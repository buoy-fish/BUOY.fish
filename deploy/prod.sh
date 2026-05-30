#!/bin/bash

# BUOY.fish Production Deployment Script
# Deploys to Cloudflare Pages at buoy.fish

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 BUOY.fish Production Deployment${NC}"
echo "=================================="

# Check for required environment
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}Error: CLOUDFLARE_API_TOKEN is not set${NC}"
    echo "Please set your Cloudflare API token:"
    echo "  export CLOUDFLARE_API_TOKEN=your_token_here"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}Error: CLOUDFLARE_ACCOUNT_ID is not set${NC}"
    echo "Please set your Cloudflare Account ID:"
    echo "  export CLOUDFLARE_ACCOUNT_ID=your_account_id_here"
    exit 1
fi

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "\n${YELLOW}🔨 Building for production...${NC}"
npm run build

echo -e "\n${YELLOW}☁️  Deploying to Cloudflare Pages...${NC}"
npx wrangler pages deploy .svelte-kit/cloudflare \
    --project-name=buoy-production-website \
    --branch=main \
    --commit-dirty=true

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your site is deploying to: https://buoy.fish"
echo ""
echo -e "${YELLOW}Note:${NC} Make sure the following secrets are set in Cloudflare Dashboard:"
echo "  - PUBLIC_SUPABASE_URL"
echo "  - PUBLIC_SUPABASE_ANON_KEY"
echo "  - PRIVATE_SUPABASE_SERVICE_ROLE"
echo "  - PUBLIC_SITE_ACCESS (set to 'public' for production)"
