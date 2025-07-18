// lib/supabase.js
// Supabase client configuration

class SupabaseClient {
  constructor() {
    this.url = process.env.SUPABASE_URL;
    this.key = process.env.SUPABASE_ANON_KEY;
    
    if (!this.url || !this.key) {
      console.warn('Supabase credentials not found, falling back to in-memory storage');
      this.enabled = false;
      return;
    }
    
    this.enabled = true;
  }

  async request(endpoint, options = {}) {
    if (!this.enabled) {
      throw new Error('Supabase not configured');
    }

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
      throw new Error(`Supabase error: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all playlists
  async getPlaylists() {
    try {
      return await this.request('/playlists?select=*');
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  }

  // Get a specific playlist by ID
  async getPlaylist(id) {
    try {
      const result = await this.request(`/playlists?slug=eq.${id}&select=*`);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching playlist:', error);
      return null;
    }
  }

  // Create a new playlist
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

  // Check if a slug exists
  async slugExists(slug) {
    try {
      const result = await this.request(`/playlists?slug=eq.${slug}&select=slug`);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  }
}

module.exports = SupabaseClient;