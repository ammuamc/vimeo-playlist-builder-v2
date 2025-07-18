// api/index.js
// Vercel serverless function for Vimeo Playlist Creator with Supabase integration

const express = require('express');
const cors = require('cors');
const slugify = require('slugify');
const { nanoid } = require('nanoid');
const SupabaseClient = require('../lib/supabase');

// Initialize Supabase client
const supabase = new SupabaseClient();

// Fallback in-memory storage (used when Supabase is not configured)
let inMemoryPlaylists = {};

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to get all playlists
async function getAllPlaylists() {
  if (supabase.enabled) {
    const playlists = await supabase.getPlaylists();
    // Convert to the format expected by the frontend
    return playlists.map(playlist => ({
      id: playlist.slug,
      name: playlist.name,
      urls: playlist.urls
    }));
  } else {
    // Use in-memory storage
    return Object.entries(inMemoryPlaylists).map(
      ([id, { name, urls }]) => ({ id, name, urls })
    );
  }
}

// Helper function to get a playlist by ID
async function getPlaylistById(id) {
  if (supabase.enabled) {
    const playlist = await supabase.getPlaylist(id);
    if (playlist) {
      return {
        id: playlist.slug,
        name: playlist.name,
        urls: playlist.urls
      };
    }
    return null;
  } else {
    // Use in-memory storage
    const playlist = inMemoryPlaylists[id];
    return playlist ? { id, ...playlist } : null;
  }
}

// Helper function to create a playlist
async function createPlaylist(name, urls) {
  // Generate a URL‑safe slug from the name
  let slug = slugify(name, { lower: true, strict: true });
  if (!slug) slug = nanoid(4);
  
  if (supabase.enabled) {
    // Check for collisions in Supabase
    if (await supabase.slugExists(slug)) {
      slug = `${slug}-${nanoid(4)}`;
    }
    
    // Create in Supabase
    await supabase.createPlaylist({ slug, name, urls });
  } else {
    // Check for collisions in memory
    if (inMemoryPlaylists[slug]) {
      slug = `${slug}-${nanoid(4)}`;
    }
    
    // Store in memory
    inMemoryPlaylists[slug] = { name, urls };
  }
  
  return slug;
}

// List all playlists (GET /api/playlists)
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await getAllPlaylists();
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Create a new playlist (POST /api/playlists)
app.post('/api/playlists', async (req, res) => {
  const { name, urls } = req.body;
  
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'urls must be a non-empty array' });
  }
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required and must be a non-empty string' });
  }

  try {
    const slug = await createPlaylist(name.trim(), urls);
    res.json({ id: slug });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Retrieve a playlist by ID (GET /api/playlists/:id)
app.get('/api/playlists/:id', async (req, res) => {
  try {
    const playlist = await getPlaylistById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    storage: supabase.enabled ? 'supabase' : 'in-memory',
    timestamp: new Date().toISOString()
  });
});

// Export the Express app as a Vercel serverless function
module.exports = app;