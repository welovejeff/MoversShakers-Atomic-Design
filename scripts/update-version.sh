#!/bin/bash
# update-version.sh
# Automatically updates the version info in index.html before each commit

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Path to index.html
INDEX_FILE="$PROJECT_ROOT/index.html"

# Check if index.html exists
if [ ! -f "$INDEX_FILE" ]; then
    echo "Error: index.html not found at $INDEX_FILE"
    exit 1
fi

# Get commit count for patch version (add 1 for this commit)
COMMIT_COUNT=$(($(git rev-list --count HEAD 2>/dev/null || echo 0) + 1))
VERSION="v2.0.$COMMIT_COUNT"

# Get current date/time in EST
# Use TZ environment variable to ensure EST timezone
DATETIME=$(TZ='America/New_York' date '+%b %-d, %Y • %-I:%M %p EST')

# Build the replacement HTML block
NEW_VERSION_BLOCK="            <!-- VERSION_START -->
            <div class=\"text-xs font-light tracking-wide opacity-80 text-right\">
                <span class=\"font-medium\">$VERSION</span>
                <span class=\"block text-[10px] opacity-70\">$DATETIME</span>
            </div>
            <!-- VERSION_END -->"

# Use perl for reliable multi-line replacement (more portable than sed -z)
perl -i -0777 -pe "s|<!-- VERSION_START -->.*?<!-- VERSION_END -->|<!-- VERSION_START -->\n            <div class=\"text-xs font-light tracking-wide opacity-80 text-right\">\n                <span class=\"font-medium\">$VERSION</span>\n                <span class=\"block text-[10px] opacity-70\">$DATETIME</span>\n            </div>\n            <!-- VERSION_END -->|s" "$INDEX_FILE"

# Stage the updated index.html
git add "$INDEX_FILE"

echo "Updated version to $VERSION ($DATETIME)"
