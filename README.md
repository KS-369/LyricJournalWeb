# LyricJournalWeb

A simple, elegant web application for saving and organizing your favourite song lyrics with personal notes.

## Features

- **User Authentication** - Secure registration and login system
- **Lyric Management** - Add, edit, delete, and search your saved lyrics
- **Personal Notes** - Add your own thoughts and memories to each lyric
- **Real-time Search** - Instantly find lyrics by song title, artist, or content
- **Responsive Design** - Works beautifully on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js, JWT authentication, bcrypt
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: File-based JSON storage
- **Styling**: Custom CSS with gradients and animations

## Installation

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
3. **View your collection** in the View Lyrics tab
4. **Search** through your lyrics using the search bar
5. **Edit or delete** lyrics as needed

## File Structure

```
LyricJournalWeb/
├── public/
│   ├── index.html      # Main HTML file
│   ├── script.js       # Frontend JavaScript
│   └── style.css       # Styling
├── server.js           # Express server and API routes
├── package.json        # Node.js dependencies
├── database.json       # Auto-generated user data (created on first run)
└── README.md          # This file
```

## API Endpoints

- `POST /api/register` - Create new user account
- `POST /api/login` - User login
- `GET /api/lyrics` - Get user's lyrics (authenticated)
- `POST /api/lyrics` - Add new lyric (authenticated)
- `PUT /api/lyrics/:id` - Update existing lyric (authenticated)
- `DELETE /api/lyrics/:id` - Delete lyric (authenticated)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- XSS prevention through HTML escaping

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
