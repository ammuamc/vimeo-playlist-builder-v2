# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vimeo Playlist Creator application consisting of a Node.js Express server with a static web frontend. The application allows users to create and share custom Vimeo video playlists.

## Key Commands

### Development
- `npm start` - Start the server (runs `node server.js`)
- `npm test` - No tests configured (returns error message)

### Server Operation
- Server runs on port 3000 by default (configurable via PORT environment variable)
- Navigate to `vimeo-playlist-creator/` directory before running commands
- Database file `db.json` is created automatically in the project directory

## Architecture

### Backend (server.js)
- **Framework**: Express.js with CORS enabled
- **Database**: lowdb with JSON file storage (`db.json`)
- **Data Structure**: Playlists stored as `{id: {name, urls}}` where:
  - `id` is a URL-safe slug generated from playlist name (with collision handling)
  - `name` is the user-provided playlist title
  - `urls` is an array of Vimeo video URLs

### API Endpoints
- `GET /api/playlists` - List all playlists
- `POST /api/playlists` - Create new playlist (requires `name` and `urls` array)
- `GET /api/playlists/:id` - Retrieve specific playlist by slug ID

### Frontend (public/)
- **Entry Point**: `index.html` - Single-page application
- **Main Logic**: `main.js` - Handles video loading, playlist creation, drag-and-drop reordering
- **Styling**: `style.css` - Complete UI styling
- **Dependencies**: SortableJS (CDN) for drag-and-drop functionality

### Frontend Features
- **Builder Mode**: Default mode for creating playlists
  - Load videos from URLs (textarea input)
  - Load existing playlists from URL
  - Drag-and-drop video reordering
  - Save playlists to server
- **Viewer Mode**: Activated via `?playlistId=<id>` URL parameter
  - Hides builder controls
  - Displays playlist name as page title
  - Auto-loads playlist videos

### Video Handling
- Uses Vimeo oEmbed API for video metadata and thumbnails
- Supports both public and private Vimeo videos (with hash parameters)
- Implements duplicate video detection and removal
- Auto-plays first video when playlist loads

## File Structure
```
vimeo-playlist-creator/
├── server.js           # Express server and API
├── package.json        # Dependencies and scripts
├── db.json            # JSON database (auto-created)
└── public/            # Static frontend files
    ├── index.html     # Main application page
    ├── main.js        # Frontend JavaScript logic
    ├── style.css      # Application styling
    ├── responsive.js  # Responsive layout enhancements
    └── images/        # Logo assets
```

## Development Notes

- No build process required - server serves static files directly
- Database is a simple JSON file that persists playlist data
- Playlist IDs are generated using slugify + nanoid for URL-safe, readable identifiers
- Application handles both builder and viewer modes in the same codebase
- No authentication or user management implemented