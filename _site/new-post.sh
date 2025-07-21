#!/bin/bash

# Script to create a new Jekyll blog post
# Usage: ./new-post.sh "Your Post Title"

if [ $# -eq 0 ]; then
    echo "Usage: ./new-post.sh \"Your Post Title\""
    echo "Example: ./new-post.sh \"My Amazing Blog Post\""
    exit 1
fi

# Get the title from command line argument
TITLE="$1"

# Generate filename-friendly version of title
FILENAME=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | sed 's/ /-/g')

# Get current date
DATE=$(date +%Y-%m-%d)

# Create the filename
FILEPATH="_posts/${DATE}-${FILENAME}.md"

# Check if file already exists
if [ -f "$FILEPATH" ]; then
    echo "Error: File $FILEPATH already exists!"
    exit 1
fi

# Create the post file with front matter
cat > "$FILEPATH" << EOF
---
layout: post
title: "$TITLE"
date: $DATE
categories: [blog]
tags: []
---

# $TITLE

Write your blog post content here using Markdown.

## Getting Started

- Edit this file to add your content
- Use Markdown syntax for formatting
- Save the file and Jekyll will automatically regenerate your site

## Example Formatting

**Bold text**, *italic text*, and \`inline code\`.

\`\`\`
Code blocks look like this
\`\`\`

That's it! Your post will be available at: http://localhost:4000/personal/blog/$DATE/$(echo $FILENAME)/
EOF

echo "✅ Created new post: $FILEPATH"
echo "📝 Edit the file to add your content"
echo "🌐 It will be available at: http://localhost:4000/personal/blog/$DATE/$FILENAME/"

# Make the file executable if we're creating the script itself
if [[ "$FILEPATH" == *".sh" ]]; then
    chmod +x "$FILEPATH"
fi