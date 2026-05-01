// ── GET PAGE ELEMENTS ────────────────────────────────

var newGameBtn      = document.getElementById('new-game-btn');
var createGameSec   = document.getElementById('create-game');
var cancelGameBtn   = document.getElementById('cancel-game-btn');
var gameForm        = document.getElementById('game-form');

var gameLibraryView = document.getElementById('game-library-view');
var gameDetailView  = document.getElementById('game-detail-view');
var gameDetailTitle = document.getElementById('game-detail-title');
var gameDetailDesc  = document.getElementById('game-detail-desc');
var backToGamesBtn  = document.getElementById('back-to-games-btn');

var activeGamesGrid    = document.getElementById('active-games');
var finishedGamesGrid  = document.getElementById('finished-games');
var abandonedGamesGrid = document.getElementById('abandoned-games');

var newCharBtn     = document.getElementById('new-char-btn');
var createCharSec  = document.getElementById('create-char');
var cancelCharBtn  = document.getElementById('cancel-char-btn');
var charForm       = document.getElementById('char-form');
var charGrid       = document.getElementById('char-grid');

var newStoryBtn    = document.getElementById('new-story-btn');
var createStorySec = document.getElementById('create-story');
var cancelStoryBtn = document.getElementById('cancel-story-btn');
var storyForm      = document.getElementById('story-form');
var storyGrid      = document.getElementById('story-grid');

var tabBtns       = document.querySelectorAll('.tab-btn');
var tabCharacters = document.getElementById('tab-characters');
var tabStory      = document.getElementById('tab-story');

// ── LOAD DATA ────────────────────────────────────────

var games          = JSON.parse(localStorage.getItem('games')) || [];
var currentGameId  = null;

// ── SAVE ─────────────────────────────────────────────

function save() {
    localStorage.setItem('games', JSON.stringify(games));
}

// ── SHOW / HIDE GAME FORM ─────────────────────────────

newGameBtn.addEventListener('click', function() {
    createGameSec.style.display = 'block';
    newGameBtn.style.display = 'none';
});

cancelGameBtn.addEventListener('click', function() {
    createGameSec.style.display = 'none';
    newGameBtn.style.display = 'block';
    gameForm.reset();
});

// ── CREATE GAME ───────────────────────────────────────

gameForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var game = {
        id:         Date.now(),
        title:      document.getElementById('game-title').value,
        genre:      document.getElementById('game-genre').value,
        engine:     document.getElementById('game-engine').value,
        desc:       document.getElementById('game-desc').value,
        status:     'active',
        characters: [],
        story:      []
    };

    games.push(game);
    save();
    gameForm.reset();
    createGameSec.style.display = 'none';
    newGameBtn.style.display = 'block';
    renderGameLibrary();
});

// ── RENDER GAME LIBRARY ───────────────────────────────

function renderGameLibrary() {
    var active = [], finished = [], abandoned = [];

    for (var i = 0; i < games.length; i++) {
        if (games[i].status === 'active')        active.push(games[i]);
        else if (games[i].status === 'finished') finished.push(games[i]);
        else                                     abandoned.push(games[i]);
    }

    activeGamesGrid.innerHTML    = active.length    ? active.map(buildGameCard).join('')    : '<p class="empty-msg">No games in development yet.</p>';
    finishedGamesGrid.innerHTML  = finished.length  ? finished.map(buildGameCard).join('')  : '<p class="empty-msg">No finished games yet.</p>';
    abandonedGamesGrid.innerHTML = abandoned.length ? abandoned.map(buildGameCard).join('') : '<p class="empty-msg">No shelved games.</p>';
}

// ── BUILD GAME CARD ───────────────────────────────────

function buildGameCard(g) {
    var statusBtn = '';
    if (g.status === 'active') {
        statusBtn = '<button onclick="setGameStatus(' + g.id + ', \'finished\')">Finish</button>'
                  + '<button onclick="setGameStatus(' + g.id + ', \'abandoned\')">Shelve</button>';
    } else {
        statusBtn = '<button onclick="setGameStatus(' + g.id + ', \'active\')">Reactivate</button>';
    }

    return '<div class="game-card">'
        + '<h4>' + g.title + '</h4>'
        + '<p>' + (g.genre || 'No genre') + '</p>'
        + '<p>' + (g.engine || 'No engine listed') + '</p>'
        + '<div class="card-buttons">'
        + '<button onclick="openGame(' + g.id + ')">Open</button>'
        + statusBtn
        + '<button class="btn-delete" onclick="deleteGame(' + g.id + ')">Delete</button>'
        + '</div>'
        + '</div>';
}

// ── OPEN GAME ─────────────────────────────────────────

function openGame(id) {
    for (var i = 0; i < games.length; i++) {
        if (games[i].id === id) {
            currentGameId = id;
            gameDetailTitle.textContent = games[i].title;
            gameDetailDesc.textContent  = games[i].desc || '';
        }
    }

    gameLibraryView.style.display = 'none';
    gameDetailView.style.display  = 'block';
    showTab('characters');
}

// ── BACK TO GAMES ─────────────────────────────────────

backToGamesBtn.addEventListener('click', function() {
    gameDetailView.style.display  = 'none';
    gameLibraryView.style.display = 'block';
    currentGameId = null;
    renderGameLibrary();
});

// ── SET GAME STATUS ───────────────────────────────────

function setGameStatus(id, status) {
    for (var i = 0; i < games.length; i++) {
        if (games[i].id === id) games[i].status = status;
    }
    save();
    renderGameLibrary();
}

// ── DELETE GAME ───────────────────────────────────────

function deleteGame(id) {
    if (!confirm('Delete this game and all its data?')) return;
    var updated = [];
    for (var i = 0; i < games.length; i++) {
        if (games[i].id !== id) updated.push(games[i]);
    }
    games = updated;
    save();
    renderGameLibrary();
}

// ── TABS ──────────────────────────────────────────────

for (var i = 0; i < tabBtns.length; i++) {
    tabBtns[i].addEventListener('click', function() {
        showTab(this.getAttribute('data-tab'));
    });
}

function showTab(tab) {
    tabCharacters.style.display = tab === 'characters' ? 'block' : 'none';
    tabStory.style.display      = tab === 'story'      ? 'block' : 'none';

    for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove('active');
        if (tabBtns[i].getAttribute('data-tab') === tab) {
            tabBtns[i].classList.add('active');
        }
    }

    if (tab === 'characters') renderChars();
    if (tab === 'story')      renderStory();
}

// ── CHARACTER FORM ────────────────────────────────────

newCharBtn.addEventListener('click', function() {
    createCharSec.style.display = 'block';
    newCharBtn.style.display = 'none';
});

cancelCharBtn.addEventListener('click', function() {
    createCharSec.style.display = 'none';
    newCharBtn.style.display = 'block';
    charForm.reset();
});

charForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var char = {
        id:     Date.now(),
        name:   document.getElementById('char-name').value,
        role:   document.getElementById('char-role').value,
        notes:  document.getElementById('char-notes').value,
        status: document.getElementById('char-status').value
    };

    for (var i = 0; i < games.length; i++) {
        if (games[i].id === currentGameId) games[i].characters.push(char);
    }

    save();
    charForm.reset();
    createCharSec.style.display = 'none';
    newCharBtn.style.display = 'block';
    renderChars();
});

function renderChars() {
    var current = getCurrentGame();
    if (!current) return;

    if (current.characters.length === 0) {
        charGrid.innerHTML = '<p class="empty-msg">No characters yet.</p>';
        return;
    }

    charGrid.innerHTML = '';
    for (var i = 0; i < current.characters.length; i++) {
        var c = current.characters[i];
        charGrid.innerHTML += '<div class="entry-card">'
            + '<h4>' + c.name + '</h4>'
            + '<p>' + (c.role || 'No role listed') + '</p>'
            + '<p>' + (c.notes || '') + '</p>'
            + '<span class="status-badge status-' + c.status + '">' + c.status + '</span>'
            + '<div class="card-buttons">'
            + '<button class="btn-delete" onclick="deleteChar(' + c.id + ')">Delete</button>'
            + '</div></div>';
    }
}

function deleteChar(id) {
    if (!confirm('Delete this character?')) return;
    for (var i = 0; i < games.length; i++) {
        if (games[i].id === currentGameId) {
            var updated = [];
            for (var j = 0; j < games[i].characters.length; j++) {
                if (games[i].characters[j].id !== id) updated.push(games[i].characters[j]);
            }
            games[i].characters = updated;
        }
    }
    save();
    renderChars();
}

// ── STORY FORM ────────────────────────────────────────

newStoryBtn.addEventListener('click', function() {
    createStorySec.style.display = 'block';
    newStoryBtn.style.display = 'none';
});

cancelStoryBtn.addEventListener('click', function() {
    createStorySec.style.display = 'none';
    newStoryBtn.style.display = 'block';
    storyForm.reset();
});

storyForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var entry = {
        id:     Date.now(),
        title:  document.getElementById('story-title').value,
        notes:  document.getElementById('story-notes').value,
        status: document.getElementById('story-status').value
    };

    for (var i = 0; i < games.length; i++) {
        if (games[i].id === currentGameId) games[i].story.push(entry);
    }

    save();
    storyForm.reset();
    createStorySec.style.display = 'none';
    newStoryBtn.style.display = 'block';
    renderStory();
});

function renderStory() {
    var current = getCurrentGame();
    if (!current) return;

    if (current.story.length === 0) {
        storyGrid.innerHTML = '<p class="empty-msg">No story entries yet.</p>';
        return;
    }

    storyGrid.innerHTML = '';
    for (var i = 0; i < current.story.length; i++) {
        var e = current.story[i];
        storyGrid.innerHTML += '<div class="entry-card">'
            + '<h4>' + e.title + '</h4>'
            + '<p>' + (e.notes || '') + '</p>'
            + '<span class="status-badge status-' + e.status + '">' + e.status + '</span>'
            + '<div class="card-buttons">'
            + '<button class="btn-delete" onclick="deleteStoryEntry(' + e.id + ')">Delete</button>'
            + '</div></div>';
    }
}

function deleteStoryEntry(id) {
    if (!confirm('Delete this story entry?')) return;
    for (var i = 0; i < games.length; i++) {
        if (games[i].id === currentGameId) {
            var updated = [];
            for (var j = 0; j < games[i].story.length; j++) {
                if (games[i].story[j].id !== id) updated.push(games[i].story[j]);
            }
            games[i].story = updated;
        }
    }
    save();
    renderStory();
}

// ── HELPER ───────────────────────────────────────────

function getCurrentGame() {
    for (var i = 0; i < games.length; i++) {
        if (games[i].id === currentGameId) return games[i];
    }
    return null;
}

// ── INIT ─────────────────────────────────────────────

renderGameLibrary();