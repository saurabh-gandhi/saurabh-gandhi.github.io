# CLAUDE.md

This file provides guidance to Claude Code when working with this Jekyll-based personal website repository.

## Repository Overview

This is a personal website (saurabh-gandhi.github.io) built with Jekyll, a static site generator. The site showcases personal projects, blog posts, and professional information.

## Project Structure

- **_config.yml** - Jekyll configuration file
- **_layouts/** - HTML templates for different page types
- **_posts/** - Blog posts in Markdown format
- **_site/** - Generated static site (build output)
- **css/** - Stylesheets including Bootstrap
- **js/** - JavaScript files
- **images/** - Static images and assets
- **libs/** - Third-party libraries (Font Awesome)

## Common Commands

### Development
```bash
# Install dependencies
bundle install

# Serve locally with live reload
bundle exec jekyll serve

# Build the site
bundle exec jekyll build

# Build for production
JEKYLL_ENV=production bundle exec jekyll build
```

### Creating Content
```bash
# Create a new blog post
./new-post.sh "Post Title"
```

## Key Files

- **index.html** - Homepage
- **posts.html** - Blog posts listing page
- **story.html** - About/story page
- **_layouts/default.html** - Main site template
- **_layouts/post.html** - Blog post template

## Jekyll Configuration

- **Markdown processor:** kramdown
- **Syntax highlighter:** rouge
- **Permalink structure:** /:categories/:year/:month/:day/:title/
- **Plugins:** jekyll-feed, jekyll-sitemap

## Styling

- **CSS Framework:** Bootstrap
- **Icons:** Font Awesome
- **Custom styles:** css/styles.css

## Notes

- Site is hosted on GitHub Pages
- Uses Jekyll's default configuration optimized for GitHub Pages
- Blog posts should be placed in _posts/ with YAML front matter
- Images and assets go in the images/ directory