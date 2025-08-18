const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple file-based database
const DB_FILE = 'database.json';

// Initialize database
async function initDatabase() {
    try {
        await fs.access(DB_FILE);
        console.log('Database file exists');
    } catch {
        try {
            // Create empty database if it doesn't exist
            const initialData = { users: {}, lyrics: {} };
            await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
            console.log('Created new database file');
        } catch (error) {
            console.error('Failed to create database file:', error);
            throw error;
        }
    }
}

// Read database
async function readDatabase() {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
}

// Write database
async function writeDatabase(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Input validation and sanitization
function validateAndSanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, 5000); // Limit length to prevent abuse
}

function validateTags(tags) {
    if (!Array.isArray(tags)) return [];
    return tags
        .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        .map(tag => validateAndSanitizeInput(tag))
        .slice(0, 20); // Limit to 20 tags max
}

// Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        if (username.length < 3 || password.length < 4) {
            return res.status(400).json({ error: 'Username must be 3+ characters, password 4+ characters' });
        }

        const db = await readDatabase();
        
        if (db.users[username.toLowerCase()]) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.users[username.toLowerCase()] = {
            username: username,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        db.lyrics[username.toLowerCase()] = [];

        await writeDatabase(db);

        const token = jwt.sign({ username: username.toLowerCase() }, JWT_SECRET);
        res.json({ success: true, token, username });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const db = await readDatabase();
        const user = db.users[username.toLowerCase()];

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ username: username.toLowerCase() }, JWT_SECRET);
        res.json({ success: true, token, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's lyrics
app.get('/api/lyrics', authenticateToken, async (req, res) => {
    try {
        const db = await readDatabase();
        const userLyrics = db.lyrics[req.user.username] || [];
        res.json(userLyrics);
    } catch (error) {
        console.error('Get lyrics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add lyric
app.post('/api/lyrics', authenticateToken, async (req, res) => {
    try {
        const { title, artist, lyricText, note, tags } = req.body;
        
        if (!title || !artist || !lyricText) {
            return res.status(400).json({ error: 'Title, artist, and lyric text required' });
        }

        const newLyric = {
            id: Date.now(),
            title: validateAndSanitizeInput(title),
            artist: validateAndSanitizeInput(artist),
            lyricText: validateAndSanitizeInput(lyricText),
            note: validateAndSanitizeInput(note || ''),
            tags: validateTags(tags || []),
            dateAdded: new Date().toISOString().split('T')[0]
        };

        const db = await readDatabase();
        if (!db.lyrics[req.user.username]) {
            db.lyrics[req.user.username] = [];
        }
        db.lyrics[req.user.username].unshift(newLyric);
        
        await writeDatabase(db);
        res.json(newLyric);
    } catch (error) {
        console.error('Add lyric error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update lyric
app.put('/api/lyrics/:id', authenticateToken, async (req, res) => {
    try {
        const { title, artist, lyricText, note, tags } = req.body;
        const lyricId = parseInt(req.params.id);
        
        if (!title || !artist || !lyricText) {
            return res.status(400).json({ error: 'Title, artist, and lyric text required' });
        }
        
        const db = await readDatabase();
        const userLyrics = db.lyrics[req.user.username] || [];
        const lyricIndex = userLyrics.findIndex(l => l.id === lyricId);
        
        if (lyricIndex === -1) {
            return res.status(404).json({ error: 'Lyric not found' });
        }

        userLyrics[lyricIndex] = {
            ...userLyrics[lyricIndex],
            title: validateAndSanitizeInput(title),
            artist: validateAndSanitizeInput(artist),
            lyricText: validateAndSanitizeInput(lyricText),
            note: validateAndSanitizeInput(note || ''),
            tags: validateTags(tags || [])
        };

        await writeDatabase(db);
        res.json(userLyrics[lyricIndex]);
    } catch (error) {
        console.error('Update lyric error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete lyric
app.delete('/api/lyrics/:id', authenticateToken, async (req, res) => {
    try {
        const lyricId = parseInt(req.params.id);
        
        const db = await readDatabase();
        const userLyrics = db.lyrics[req.user.username] || [];
        const lyricIndex = userLyrics.findIndex(l => l.id === lyricId);
        
        if (lyricIndex === -1) {
            return res.status(404).json({ error: 'Lyric not found' });
        }

        userLyrics.splice(lyricIndex, 1);
        await writeDatabase(db);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete lyric error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's tags (for analytics/suggestions)
app.get('/api/tags', authenticateToken, async (req, res) => {
    try {
        const db = await readDatabase();
        const userLyrics = db.lyrics[req.user.username] || [];
        
        // Collect all tags and count their usage
        const tagCounts = {};
        userLyrics.forEach(lyric => {
            if (lyric.tags) {
                lyric.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        
        // Sort tags by usage count
        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([tag, count]) => ({ tag, count }));
        
        res.json(sortedTags);
    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
initDatabase().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Visit: http://localhost:${PORT}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
            app.listen(PORT + 1, () => {
                console.log(`Server running on port ${PORT + 1}`);
                console.log(`Visit: http://localhost:${PORT + 1}`);
            });
        } else {
            console.error('Server error:', error);
            process.exit(1);
        }
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

