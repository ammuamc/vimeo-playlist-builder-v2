// api/index.js
// Vercel serverless function for Vimeo Playlist Creator with Supabase integration

const express = require('express');
const cors = require('cors');
const slugify = require('slugify');
const { nanoid } = require('nanoid');

// Simple fetch polyfill check for Node.js environments
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Supabase client class
class SupabaseClient {
  constructor() {
    this.url = process.env.SUPABASE_URL;
    this.key = process.env.SUPABASE_ANON_KEY;
    
    if (!this.url || !this.key) {
      console.warn('Supabase credentials not found, using in-memory storage');
      this.enabled = false;
      return;
    }
    
    this.enabled = true;
  }

  async request(endpoint, options = {}) {
    if (!this.enabled) {
      throw new Error('Supabase not configured');
    }

    try {
      const response = await fetch(`${this.url}/rest/v1${endpoint}`, {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Supabase request failed:', error);
      throw error;
    }
  }

  async getPlaylists() {
    try {
      return await this.request('/playlists?select=*&order=created_at.desc');
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  }

  async getPlaylist(id) {
    try {
      const result = await this.request(`/playlists?slug=eq.${encodeURIComponent(id)}&select=*`);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching playlist:', error);
      return null;
    }
  }

  async createPlaylist(data) {
    try {
      const result = await this.request('/playlists', {
        method: 'POST',
        body: JSON.stringify({
          slug: data.slug,
          name: data.name,
          urls: data.urls,
          created_at: new Date().toISOString()
        })
      });
      return result[0];
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async slugExists(slug) {
    try {
      const result = await this.request(`/playlists?slug=eq.${encodeURIComponent(slug)}&select=slug`);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  }
}

// Initialize Supabase client
const supabase = new SupabaseClient();

// Fallback in-memory storage
let inMemoryPlaylists = {};

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Helper functions
async function getAllPlaylists() {
  try {
    if (supabase.enabled) {
      const playlists = await supabase.getPlaylists();
      return playlists.map(playlist => ({
        id: playlist.slug,
        name: playlist.name,
        urls: playlist.urls || []
      }));
    } else {
      return Object.entries(inMemoryPlaylists).map(
        ([id, { name, urls }]) => ({ id, name, urls: urls || [] })
      );
    }
  } catch (error) {
    console.error('Error in getAllPlaylists:', error);
    return [];
  }
}

async function getPlaylistById(id) {
  try {
    if (supabase.enabled) {
      const playlist = await supabase.getPlaylist(id);
      if (playlist) {
        return {
          id: playlist.slug,
          name: playlist.name,
          urls: playlist.urls || []
        };
      }
      return null;
    } else {
      const playlist = inMemoryPlaylists[id];
      return playlist ? { id, name: playlist.name, urls: playlist.urls || [] } : null;
    }
  } catch (error) {
    console.error('Error in getPlaylistById:', error);
    return null;
  }
}

async function createPlaylist(name, urls) {
  try {
    // Generate slug
    let slug = slugify(name, { lower: true, strict: true });
    if (!slug) slug = nanoid(4);
    
    if (supabase.enabled) {
      // Check for collisions in Supabase
      if (await supabase.slugExists(slug)) {
        slug = `${slug}-${nanoid(4)}`;
      }
      
      await supabase.createPlaylist({ slug, name, urls });
    } else {
      // Check for collisions in memory
      if (inMemoryPlaylists[slug]) {
        slug = `${slug}-${nanoid(4)}`;
      }
      
      inMemoryPlaylists[slug] = { name, urls };
    }
    
    return slug;
  } catch (error) {
    console.error('Error in createPlaylist:', error);
    throw error;
  }
}

// Routes
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await getAllPlaylists();
    res.json(playlists);
  } catch (error) {
    console.error('Error in GET /api/playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

app.post('/api/playlists', async (req, res) => {
  try {
    const { name, urls } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'name is required and must be a non-empty string' });
    }
    
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'urls must be a non-empty array' });
    }

    const slug = await createPlaylist(name.trim(), urls);
    res.json({ id: slug });
  } catch (error) {
    console.error('Error in POST /api/playlists:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

app.get('/api/playlists/:id', async (req, res) => {
  try {
    const playlist = await getPlaylistById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Error in GET /api/playlists/:id:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    storage: supabase.enabled ? 'supabase' : 'in-memory',
    timestamp: new Date().toISOString()
  });
});

// Catch-all for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Export for Vercel
module.exports = app;