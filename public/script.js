// Global state
let currentUser = null;
let authToken = null;
let lyrics = [];
let filteredLyrics = [];

// API base URL - will work in both development and production
const API_BASE = window.location.origin;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('lyricjournalToken');
    const username = localStorage.getItem('lyricjournalUsername');
    
    if (token && username) {
        authToken = token;
        currentUser = username;
        showMainApp();
        loadLyrics();
    } else {
        showAuthForm();
    }
    
    // Setup event listeners
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    // Auth forms
    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('register-form-element').addEventListener('submit', handleRegister);
    
    // Main app forms
    document.getElementById('lyric-form').addEventListener('submit', addLyric);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchLyrics();
    });
}

// Auth functions
function switchToRegister() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
}

function switchToLogin() {
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.username;
            
            // Store in localStorage
            localStorage.setItem('lyricjournalToken', authToken);
            localStorage.setItem('lyricjournalUsername', currentUser);
            
            showMainApp();
            loadLyrics();
            showSuccess('Welcome back!');
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    if (username.length < 3) {
        showError('Username must be at least 3 characters long');
        return;
    }
    
    if (password.length < 4) {
        showError('Password must be at least 4 characters long');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.username;
            
            // Store in localStorage
            localStorage.setItem('lyricjournalToken', authToken);
            localStorage.setItem('lyricjournalUsername', currentUser);
            
            showMainApp();
            loadLyrics();
            showSuccess(`Welcome to LyricJournal, ${currentUser}!`);
        } else {
            showError(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Register error:', error);
        showError('Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

function logout() {
    // Clear stored data
    localStorage.removeItem('lyricjournalToken');
    localStorage.removeItem('lyricjournalUsername');
    
    // Reset state
    authToken = null;
    currentUser = null;
    lyrics = [];
    filteredLyrics = [];
    
    // Show auth form
    showAuthForm();
    switchToLogin();
}

// UI functions
function showAuthForm() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function showMainApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('username-display').textContent = `Hello, ${currentUser}!`;
}

function showLoading(show) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}

function showError(message) {
    // Remove existing messages
    removeMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Add to current active form
    const activeForm = document.querySelector('.auth-form.active') || document.querySelector('.tab-content.active');
    if (activeForm) {
        activeForm.insertBefore(errorDiv, activeForm.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

function showSuccess(message) {
    // Remove existing messages
    removeMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Add to current active tab
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        activeTab.insertBefore(successDiv, activeTab.firstChild);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

function removeMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => {
        if (msg.parentNode) {
            msg.parentNode.removeChild(msg);
        }
    });
}

// Tab functions
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.tab:nth-child(${tabName === 'add' ? '1' : '2'})`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    if (tabName === 'view') {
        displayLyrics();
    }
}

// Lyric functions
async function loadLyrics() {
    try {
        const response = await fetch(`${API_BASE}/api/lyrics`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            lyrics = await response.json();
            filteredLyrics = lyrics;
            displayLyrics();
        } else {
            throw new Error('Failed to load lyrics');
        }
    } catch (error) {
        console.error('Load lyrics error:', error);
        showError('Failed to load your lyrics');
    }
}

async function addLyric(event) {
    event.preventDefault();
    
    const title = document.getElementById('song-title').value.trim();
    const artist = document.getElementById('artist').value.trim();
    const lyricText = document.getElementById('lyric-text').value.trim();
    const note = document.getElementById('note').value.trim();
    
    if (!title || !artist || !lyricText) {
        showError('Please fill in Song Title, Artist, and Lyric Text fields.');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/lyrics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, artist, lyricText, note })
        });
        
        if (response.ok) {
            const newLyric = await response.json();
            lyrics.unshift(newLyric);
            filteredLyrics = lyrics;
            
            clearForm();
            showSuccess('Lyric added successfully!');
            switchTab('view');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to add lyric');
        }
    } catch (error) {
        console.error('Add lyric error:', error);
        showError('Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

function clearForm() {
    document.getElementById('lyric-form').reset();
    document.getElementById('song-title').focus();
}

function searchLyrics() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (!query) {
        showAllLyrics();
        return;
    }
    
    filteredLyrics = lyrics.filter(lyric => 
        lyric.title.toLowerCase().includes(query) ||
        lyric.artist.toLowerCase().includes(query) ||
        lyric.lyricText.toLowerCase().includes(query) ||
        (lyric.note && lyric.note.toLowerCase().includes(query))
    );
    
    displayLyrics();
}

function showAllLyrics() {
    document.getElementById('search-input').value = '';
    filteredLyrics = lyrics;
    displayLyrics();
}

function displayLyrics() {
    const container = document.getElementById('lyrics-container');
    
    if (filteredLyrics.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No lyrics found</h3>
                <p>${lyrics.length === 0 ? 'Start by adding your first lyric!' : 'Try a different search term.'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredLyrics.map(lyric => `
        <div class="lyric-entry">
            <div class="lyric-header">
                <div>
                    <div class="lyric-title">${escapeHtml(lyric.title)}</div>
                    <div class="lyric-artist">by ${escapeHtml(lyric.artist)}</div>
                </div>
                <div class="lyric-actions">
                    <button class="btn btn-primary btn-small" onclick="editLyric(${lyric.id})">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteLyric(${lyric.id})">Delete</button>
                </div>
            </div>
            <div class="lyric-text">"${escapeHtml(lyric.lyricText)}"</div>
            ${lyric.note ? `<div class="lyric-note"><strong>Note:</strong> ${escapeHtml(lyric.note)}</div>` : ''}
            <div class="lyric-date">Added: ${lyric.dateAdded}</div>
        </div>
    `).join('');
}

async function editLyric(id) {
    const lyric = lyrics.find(l => l.id === id);
    if (!lyric) return;
    
    const newTitle = prompt('Song Title:', lyric.title);
    if (newTitle === null) return;
    
    const newArtist = prompt('Artist:', lyric.artist);
    if (newArtist === null) return;
    
    const newLyricText = prompt('Lyric Text:', lyric.lyricText);
    if (newLyricText === null) return;
    
    const newNote = prompt('Note (optional):', lyric.note || '');
    if (newNote === null) return;
    
    if (!newTitle.trim() || !newArtist.trim() || !newLyricText.trim()) {
        showError('Please fill in Song Title, Artist, and Lyric Text fields.');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/lyrics/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: newTitle.trim(),
                artist: newArtist.trim(),
                lyricText: newLyricText.trim(),
                note: newNote.trim()
            })
        });
        
        if (response.ok) {
            const updatedLyric = await response.json();
            const index = lyrics.findIndex(l => l.id === id);
            if (index !== -1) {
                lyrics[index] = updatedLyric;
                filteredLyrics = lyrics.filter(l => 
                    filteredLyrics.some(fl => fl.id === l.id)
                );
                displayLyrics();
                showSuccess('Lyric updated successfully!');
            }
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to update lyric');
        }
    } catch (error) {
        console.error('Edit lyric error:', error);
        showError('Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function deleteLyric(id) {
    const lyric = lyrics.find(l => l.id === id);
    if (!lyric) return;
    
    if (!confirm(`Are you sure you want to delete "${lyric.title}" by ${lyric.artist}?`)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/lyrics/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            lyrics = lyrics.filter(l => l.id !== id);
            filteredLyrics = filteredLyrics.filter(l => l.id !== id);
            displayLyrics();
            showSuccess('Lyric deleted successfully!');
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to delete lyric');
        }
    } catch (error) {
        console.error('Delete lyric error:', error);
        showError('Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}





