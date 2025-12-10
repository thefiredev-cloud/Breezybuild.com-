#!/bin/bash

# Content Pipeline Test Script
# Usage: ./test-pipeline.sh [function-name]
# Example: ./test-pipeline.sh generate-tool-content

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NETLIFY_URL="${NETLIFY_URL:-https://breezybuild.com}"
PIPELINE_SECRET="${PIPELINE_SECRET_KEY}"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if jq is installed (for JSON formatting)
if ! command -v jq &> /dev/null; then
    print_warning "jq not installed. Install for better JSON formatting: brew install jq"
    JQ_AVAILABLE=false
else
    JQ_AVAILABLE=true
fi

# Function to format JSON output
format_json() {
    if [ "$JQ_AVAILABLE" = true ]; then
        echo "$1" | jq '.'
    else
        echo "$1"
    fi
}

# Test daily-content-pipeline
test_daily_pipeline() {
    print_info "Testing daily-content-pipeline..."

    RESPONSE=$(curl -s -w "\n%{http_code}" \
        "$NETLIFY_URL/.netlify/functions/daily-content-pipeline")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Daily pipeline test passed (HTTP $HTTP_CODE)"
        format_json "$BODY"
    else
        print_error "Daily pipeline test failed (HTTP $HTTP_CODE)"
        echo "$BODY"
        return 1
    fi
}

# Test generate-tool-content
test_generate_content() {
    print_info "Testing generate-tool-content..."

    if [ -z "$PIPELINE_SECRET" ]; then
        print_error "PIPELINE_SECRET_KEY environment variable not set"
        print_info "Set it with: export PIPELINE_SECRET_KEY=your_secret_key"
        return 1
    fi

    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "X-Pipeline-Secret: $PIPELINE_SECRET" \
        -d '{"trigger": "manual_trigger"}' \
        "$NETLIFY_URL/.netlify/functions/generate-tool-content")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Content generation test passed (HTTP $HTTP_CODE)"
        format_json "$BODY"
    else
        print_error "Content generation test failed (HTTP $HTTP_CODE)"
        echo "$BODY"
        return 1
    fi
}

# Test retry-failed-content
test_retry_pipeline() {
    print_info "Testing retry-failed-content..."

    RESPONSE=$(curl -s -w "\n%{http_code}" \
        "$NETLIFY_URL/.netlify/functions/retry-failed-content")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Retry pipeline test passed (HTTP $HTTP_CODE)"
        format_json "$BODY"
    else
        print_error "Retry pipeline test failed (HTTP $HTTP_CODE)"
        echo "$BODY"
        return 1
    fi
}

# Main script
echo ""
echo "================================================"
echo "   Content Pipeline Test Suite"
echo "================================================"
echo ""
print_info "Netlify URL: $NETLIFY_URL"
echo ""

# Parse command line arguments
FUNCTION_NAME="${1:-all}"

case "$FUNCTION_NAME" in
    "daily-content-pipeline"|"daily")
        test_daily_pipeline
        ;;
    "generate-tool-content"|"generate")
        test_generate_content
        ;;
    "retry-failed-content"|"retry")
        test_retry_pipeline
        ;;
    "all")
        print_info "Running all tests..."
        echo ""
        test_daily_pipeline
        echo ""
        test_retry_pipeline
        echo ""
        print_warning "Skipping generate-tool-content (requires secret key and generates real content)"
        print_info "To test content generation manually:"
        print_info "  export PIPELINE_SECRET_KEY=your_secret_key"
        print_info "  ./test-pipeline.sh generate"
        ;;
    *)
        print_error "Unknown function: $FUNCTION_NAME"
        echo ""
        echo "Usage: $0 [function-name]"
        echo ""
        echo "Available functions:"
        echo "  daily-content-pipeline (or: daily)"
        echo "  generate-tool-content (or: generate)"
        echo "  retry-failed-content (or: retry)"
        echo "  all (default)"
        exit 1
        ;;
esac

echo ""
print_success "Test complete!"
echo ""
