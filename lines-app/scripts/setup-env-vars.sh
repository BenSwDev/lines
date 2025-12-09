#!/bin/bash
# Setup script for Testing Environment Variables

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Testing Environment Variables...${NC}\n"

# Configuration
PROJECT_NAME="lines-app"
PROD_URL="https://lines-oakc87uhm-ben-swissa.vercel.app"
GITHUB_REPO="BenSwDev/lines"
WEBHOOK_SECRET="b18e0a77ed6990e6285f8c4722d0a38dd17c57e4855fd8d6be407736aea492ac"
WEBHOOK_URL="${PROD_URL}/api/admin/tests/webhook"

echo -e "${YELLOW}Generated Webhook Secret: ${WEBHOOK_SECRET}${NC}\n"

echo -e "${GREEN}Environment Variables to set in Vercel:${NC}"
echo "PROD_URL=${PROD_URL}"
echo "GITHUB_REPO=${GITHUB_REPO}"
echo "WEBHOOK_SECRET=${WEBHOOK_SECRET}"
echo "WEBHOOK_URL=${WEBHOOK_URL}"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create Vercel KV in dashboard"
echo "2. Get KV credentials"
echo "3. Create GitHub Personal Access Token with 'workflow' permission"
echo "4. Run the commands below to set environment variables"
echo ""

