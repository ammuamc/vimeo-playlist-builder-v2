# Vimeo Playlist Builder v2

A modern web application for creating and sharing custom Vimeo video playlists. Built with Express.js and designed to deploy seamlessly on Vercel with **persistent storage via Supabase**.

## ✨ Features

- **Playlist Builder**: Create custom playlists from Vimeo video URLs
- **Drag & Drop Reordering**: Easily rearrange videos in your playlist
- **Playlist Viewer**: Clean, distraction-free viewing experience
- **Persistent Storage**: Uses Supabase (PostgreSQL) with free tier
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Duplicate Detection**: Automatically removes duplicate videos
- **URL-Safe Sharing**: Generated playlist URLs are clean and shareable
- **Smart Fallback**: Works with in-memory storage if database isn't configured

## 🚀 Live Demo

[View Live Demo](https://your-vercel-url.vercel.app)

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js (Serverless)
- **Database**: Supabase (PostgreSQL) - Free tier
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Deployment**: Vercel
- **Video API**: Vimeo oEmbed API
- **Styling**: Custom CSS with Google Fonts (Anton, Lora)
- **Interactions**: SortableJS for drag-and-drop

## 📁 Project Structure

```
├── api/
│   └── index.js          # Vercel serverless function (Express app)
├── lib/
│   └── supabase.js       # Supabase client integration
├── public/
│   ├── index.html        # Main application page
│   ├── main.js          # Frontend application logic
│   ├── style.css        # Application styling
│   ├── responsive.js    # Responsive layout enhancements
│   └── images/          # Logo assets
├── .env.example         # Environment variables template
├── vercel.json          # Vercel deployment configuration
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🏃‍♂️ Quick Start

### 1. **Clone and Install**

```bash
git clone https://github.com/ammuamc/vimeo-playlist-builder-v2.git
cd vimeo-playlist-builder-v2
npm install
```

### 2. **Set Up Database (Free)**

The app uses **Supabase** for persistent storage. It's completely free and takes 5 minutes to set up:

1. **Create Supabase account**: Go to [supabase.com](https://supabase.com) (free)
2. **Create new project**: Choose a name and region
3. **Create database table**: Use the SQL provided in the setup guide
4. **Get credentials**: Copy your project URL and API key
5. **Configure environment**: Create `.env.local` with your credentials

📋 **Detailed setup guide is included in the repository!**

### 3. **Run Locally**

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Start development server
vercel dev
```

Navigate to `http://localhost:3000`

### 4. **Deploy to Vercel**

```bash
# Deploy
vercel

# Add environment variables in Vercel dashboard:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
```

## 📖 How to Use

### Creating a Playlist

1. **Add Videos**: Paste Vimeo URLs (one per line) in the textarea
2. **Load Videos**: Click "Load Videos" to fetch video thumbnails and metadata
3. **Reorder**: Drag and drop thumbnails to reorder your playlist
4. **Save**: Click "Save Playlist" and give it a name
5. **Share**: Use the generated URL to share your playlist

### Viewing a Playlist

1. **Access**: Open a playlist URL (e.g., `yourdomain.com/?playlistId=my-playlist`)
2. **Watch**: Click any thumbnail to start playing
3. **Navigate**: Use arrow buttons to scroll through many thumbnails
4. **Responsive**: Enjoy optimal viewing on any device

## 🔧 API Endpoints

- `GET /api/playlists` - List all playlists
- `POST /api/playlists` - Create a new playlist
- `GET /api/playlists/:id` - Get a specific playlist
- `GET /api/health` - Check storage status (Supabase vs in-memory)

## 💾 Storage Options

### Supabase (Recommended - Free)
- **500MB** database storage
- **2GB** bandwidth/month
- **50k** API requests/month
- Persistent across deployments
- Real-time capabilities

### In-Memory Fallback
- Automatic fallback if Supabase isn't configured
- Perfect for development and testing
- Data resets on each deployment

## 🎨 Customization

### Styling
The app uses CSS custom properties and is easily customizable. Key colors:
- Primary: `#f04f24` (orange)
- Secondary: `#2d5a53` (teal)
- Footer: `#18332F` (dark green)

### Database Schema
```sql
playlists (
  id: BIGSERIAL PRIMARY KEY,
  slug: TEXT UNIQUE NOT NULL,
  name: TEXT NOT NULL,
  urls: JSONB NOT NULL,
  created_at: TIMESTAMP WITH TIME ZONE
)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for free PostgreSQL hosting
- [Vimeo](https://vimeo.com) for the oEmbed API
- [SortableJS](https://sortablejs.github.io/Sortable/) for drag-and-drop functionality
- [Vercel](https://vercel.com) for seamless deployment
- [Google Fonts](https://fonts.google.com) for typography

---

**Built with ❤️ for the video community**

### 💡 **Free Forever**
- Supabase: 500MB database (free tier)
- Vercel: 100GB bandwidth (hobby plan)
- Perfect for personal projects and small teams!