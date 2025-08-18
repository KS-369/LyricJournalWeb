// Global state
let currentUser = null;
let authToken = null;
let lyrics = [];
let filteredLyrics = [];

// Predefined tag categories
const PREDEFINED_TAGS = {
    mood: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Melancholy', 'Uplifting', 'Nostalgic'],
    genre: ['Pop', 'Rock', 'Hip-Hop', 'Country', 'Jazz', 'Classical', 'Electronic', 'Folk', 'R&B', 'Alternative'],
    theme: ['Love', 'Friendship', 'Life', 'Dreams', 'Hope', 'Loss', 'Growth', 'Memories', 'Freedom', 'Journey']
};

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
        initializeTagSelector();
    } else {
        showAuthForm();
    }
    
    // Setup event listeners
    setupEventListeners();
});

// Initialize tag selector
function initializeTagSelector() {
    const container = document.getElementById('tag-selector-container');
    if (container && !container.hasChildNodes()) {
        container.appendChild(createTagSelector());
    }
}

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
    initializeTagSelector();
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

// Tag functions
function createTagSelector() {
    const tagSelector = document.createElement('div');
    tagSelector.className = 'tag-selector';
    
    let html = '<div class="tag-categories">';
    
    Object.keys(PREDEFINED_TAGS).forEach(category => {
        html += `
            <div class="tag-category">
                <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <div class="tag-options">
        `;
        
        PREDEFINED_TAGS[category].forEach(tag => {
            html += `
                <span class="tag-option" onclick="toggleTagSelection(this, '${tag}')">${tag}</span>
            `;
        });
        
        html += '</div></div>';
    });
    
    html += `
        </div>
        <div class="custom-tag-input">
            <input type="text" id="custom-tag-input" placeholder="Add custom tag...">
            <button type="button" onclick="addCustomTag()">Add</button>
        </div>
        <div id="selected-tags" class="selected-tags">
            <h4>Selected Tags:</h4>
            <div class="selected-tags-list"></div>
        </div>
    `;
    
    tagSelector.innerHTML = html;
    return tagSelector;
}

function toggleTagSelection(element, tagName) {
    element.classList.toggle('selected');
    updateSelectedTagsDisplay();
}

function addCustomTag() {
    const input = document.getElementById('custom-tag-input');
    const tagText = input.value.trim();
    
    if (!tagText) return;
    
    // Check if tag already exists
    const existingTags = document.querySelectorAll('.tag-option');
    for (let tag of existingTags) {
        if (tag.textContent.toLowerCase() === tagText.toLowerCase()) {
            showError('Tag already exists');
            return;
        }
    }
    
    // Add custom tag
    const customTagsDiv = document.querySelector('.custom-tag-input');
    const newTag = document.createElement('span');
    newTag.className = 'tag-option custom-tag selected';
    newTag.textContent = tagText;
    newTag.onclick = () => toggleTagSelection(newTag, tagText);
    
    customTagsDiv.parentNode.insertBefore(newTag, customTagsDiv);
    input.value = '';
    updateSelectedTagsDisplay();
}

function updateSelectedTagsDisplay() {
    const selectedTags = Array.from(document.querySelectorAll('.tag-option.selected')).map(el => el.textContent);
    const display = document.querySelector('.selected-tags-list');
    
    if (selectedTags.length === 0) {
        display.innerHTML = '<span class="no-tags">No tags selected</span>';
    } else {
        display.innerHTML = selectedTags.map(tag => 
            `<span class="selected-tag">${escapeHtml(tag)} <span onclick="removeSelectedTag('${tag}')" class="remove-tag">×</span></span>`
        ).join('');
    }
}

function removeSelectedTag(tagName) {
    const tagElements = document.querySelectorAll('.tag-option');
    tagElements.forEach(el => {
        if (el.textContent === tagName) {
            el.classList.remove('selected');
        }
    });
    updateSelectedTagsDisplay();
}

function getSelectedTags() {
    return Array.from(document.querySelectorAll('.tag-option.selected')).map(el => el.textContent);
}

function setSelectedTags(tags) {
    // Clear all selections
    document.querySelectorAll('.tag-option').forEach(el => el.classList.remove('selected'));
    
    tags.forEach(tag => {
        const existingTag = Array.from(document.querySelectorAll('.tag-option')).find(el => el.textContent === tag);
        if (existingTag) {
            existingTag.classList.add('selected');
        } else {
            // Create custom tag if it doesn't exist
            const customTagsDiv = document.querySelector('.custom-tag-input');
            const newTag = document.createElement('span');
            newTag.className = 'tag-option custom-tag selected';
            newTag.textContent = tag;
            newTag.onclick = () => toggleTagSelection(newTag, tag);
            customTagsDiv.parentNode.insertBefore(newTag, customTagsDiv);
        }
    });
    
    updateSelectedTagsDisplay();
}

// Filter functions
function createTagFilters() {
    const allTags = new Set();
    lyrics.forEach(lyric => {
        if (lyric.tags) {
            lyric.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    if (allTags.size === 0) return '';
    
    const sortedTags = Array.from(allTags).sort();
    
    return `
        <div class="tag-filters">
            <h4>Filter by Tags:</h4>
            <div class="filter-tags">
                ${sortedTags.map(tag => 
                    `<span class="filter-tag" onclick="toggleTagFilter('${tag}')">${escapeHtml(tag)}</span>`
                ).join('')}
            </div>
            <button class="btn btn-small" onclick="clearTagFilters()">Clear Filters</button>
        </div>
    `;
}

function toggleTagFilter(tagName) {
    const filterTag = event.target;
    filterTag.classList.toggle('active');
    applyTagFilters();
}

function clearTagFilters() {
    document.querySelectorAll('.filter-tag.active').forEach(tag => tag.classList.remove('active'));
    applyTagFilters();
}

function applyTagFilters() {
    const activeFilters = Array.from(document.querySelectorAll('.filter-tag.active')).map(el => el.textContent);
    
    if (activeFilters.length === 0) {
        filteredLyrics = lyrics;
    } else {
        filteredLyrics = lyrics.filter(lyric => {
            if (!lyric.tags || lyric.tags.length === 0) return false;
            return activeFilters.some(filter => lyric.tags.includes(filter));
        });
    }
    
    displayLyrics();
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
    const tags = getSelectedTags();
    
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
            body: JSON.stringify({ title, artist, lyricText, note, tags })
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
    
    // Clear tag selections
    document.querySelectorAll('.tag-option.selected').forEach(tag => tag.classList.remove('selected'));
    
    // Remove custom tags
    document.querySelectorAll('.custom-tag').forEach(tag => tag.remove());
    
    updateSelectedTagsDisplay();
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
        (lyric.note && lyric.note.toLowerCase().includes(query)) ||
        (lyric.tags && lyric.tags.some(tag => tag.toLowerCase().includes(query)))
    );
    
    displayLyrics();
}

function showAllLyrics() {
    document.getElementById('search-input').value = '';
    clearTagFilters();
    filteredLyrics = lyrics;
    displayLyrics();
}

function displayLyrics() {
    const container = document.getElementById('lyrics-container');
    
    // Add tag filters if we have lyrics
    const tagFiltersHTML = lyrics.length > 0 ? createTagFilters() : '';
    
    if (filteredLyrics.length === 0) {
        container.innerHTML = `
            ${tagFiltersHTML}
            <div class="empty-state">
                <h3>No lyrics found</h3>
                <p>${lyrics.length === 0 ? 'Start by adding your first lyric!' : 'Try a different search term or clear the filters.'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        ${tagFiltersHTML}
        <div class="lyrics-list">
            ${filteredLyrics.map(lyric => `
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
                    ${lyric.tags && lyric.tags.length > 0 ? `
                        <div class="lyric-tags">
                            ${lyric.tags.map(tag => `<span class="lyric-tag">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="lyric-date">Added: ${lyric.dateAdded}</div>
                </div>
            `).join('')}
        </div>
    `;
}

async function editLyric(id) {
    const lyric = lyrics.find(l => l.id === id);
    if (!lyric) return;
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Edit Lyric</h3>
                <button onclick="closeModal()" class="modal-close">×</button>
            </div>
            <div class="modal-content">
                <form id="edit-lyric-form">
                    <div class="form-group">
                        <label for="edit-song-title">Song Title</label>
                        <input type="text" id="edit-song-title" value="${escapeHtml(lyric.title)}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-artist">Artist</label>
                        <input type="text" id="edit-artist" value="${escapeHtml(lyric.artist)}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-lyric-text">Lyric Text</label>
                        <textarea id="edit-lyric-text" required>${escapeHtml(lyric.lyricText)}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-note">Your Note (Optional)</label>
                        <textarea id="edit-note">${escapeHtml(lyric.note || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Tags</label>
                        <div id="edit-tag-selector"></div>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add tag selector to modal
    const editTagSelector = document.getElementById('edit-tag-selector');
    editTagSelector.appendChild(createTagSelector());
    
    // Set existing tags
    if (lyric.tags) {
        setSelectedTags(lyric.tags);
    }
    
    // Handle form submission
    document.getElementById('edit-lyric-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newTitle = document.getElementById('edit-song-title').value.trim();
        const newArtist = document.getElementById('edit-artist').value.trim();
        const newLyricText = document.getElementById('edit-lyric-text').value.trim();
        const newNote = document.getElementById('edit-note').value.trim();
        const newTags = getSelectedTags();
        
        if (!newTitle || !newArtist || !newLyricText) {
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
                    title: newTitle,
                    artist: newArtist,
                    lyricText: newLyricText,
                    note: newNote,
                    tags: newTags
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
                    closeModal();
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
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
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
