# LyricJournal 🎵

A simple, elegant web application for saving and organizing your favorite song lyrics with personal notes and tags.

## Features

- **User Authentication** - Secure registration and login system
- **Lyric Management** - Add, edit, delete, and search your saved lyrics
- **Personal Notes** - Add your own thoughts and memories to each lyric
- **Tag System** - Organize lyrics by mood, genre, theme, or custom categories
- **Advanced Filtering** - Filter lyrics by tags and search through all content
- **Real-time Search** - Instantly find lyrics by song title, artist, content, or tags
- **Responsive Design** - Works beautifully on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js, JWT authentication, bcrypt
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: File-based JSON storage
- **Styling**: Custom CSS with gradients and animations

## Live Demo

Visit the live application: **[https://lyricjournalweb.onrender.com](https://lyricjournalweb.onrender.com)**

## Local Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/LyricJournalWeb.git
cd LyricJournalWeb
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Register** a new account or **login** with existing credentials
2. **Add lyrics** by filling out the song title, artist, lyric text, and optional personal notes
3. **Tag your lyrics** using predefined categories (Mood, Genre, Theme) or create custom tags
4. **View your collection** in the View Lyrics tab
5. **Search and filter** through your lyrics using the search bar and tag filters
6. **Edit or delete** lyrics as needed

## File Structure

```
LyricJournalWeb/
├── public/
│   ├── index.html      # Main HTML file with tag interface
│   ├── script.js       # Frontend JavaScript with tagging system
│   └── style.css       # Styling with tag components
├── server.js           # Express server with tag API endpoints
├── package.json        # Node.js dependencies
├── database.json       # Auto-generated user data (created on first run)
└── README.md          # This file
```

## API Endpoints

- `POST /api/register` - Create new user account
- `POST /api/login` - User login
- `GET /api/lyrics` - Get user's lyrics (authenticated)
- `POST /api/lyrics` - Add new lyric with tags (authenticated)
- `PUT /api/lyrics/:id` - Update existing lyric and tags (authenticated)
- `DELETE /api/lyrics/:id` - Delete lyric (authenticated)
- `GET /api/tags` - Get user's tag usage statistics (authenticated)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- XSS prevention through HTML escaping
- Rate limiting and input length restrictions

---

## Project Journey

### Why I Made This Project

I was constantly screenshotting lyrics and saving them in random notes apps with no way to organize or find them later. I needed a personal, private space to save meaningful lyrics with my own thoughts and organize them by mood or theme. LyricJournal became my solution - a simple, beautiful way to curate the lyrics that matter most to me.

### How I Made This Project

1. **Planning** - Designed a clean, mobile-first interface with warm colors
2. **Backend** - Built Node.js/Express API with JWT authentication and file-based storage
3. **Frontend** - Used vanilla JavaScript and custom CSS for performance
4. **Features** - Started basic (CRUD), then added search, tags, and filtering
5. **Deployment** - Deployed to Render with mobile optimization

### What I Struggled With and Learned

**Biggest Struggles:**
- **Tag System** - Balancing predefined vs custom tags, handling variations
- **Mobile UX** - Making tag selection and modals work on touch devices  
- **State Management** - Managing app state without a framework

**Key Learnings:**
- Start simple, then enhance - basic CRUD first, features second
- Mobile-first design is essential for apps people use on-the-go
- Vanilla JavaScript teaches you fundamentals that frameworks abstract away
- User authentication adds significant complexity but is worth it for privacy
- File-based storage is perfect for small personal projects

[![Athena Award Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Faward.athena.hackclub.com%2Fapi%2Fbadge)](https://award.athena.hackclub.com?utm_source=readme)
