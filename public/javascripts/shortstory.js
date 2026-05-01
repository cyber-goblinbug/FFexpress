// ── GET PAGE ELEMENTS ────────────────────────────────

var newCollectionBtn     = document.getElementById('new-collection-btn');
var createCollectionSec  = document.getElementById('create-collection');
var cancelCollectionBtn  = document.getElementById('cancel-collection-btn');
var collectionForm       = document.getElementById('collection-form');
var collectionGrid       = document.getElementById('collection-grid');

var collectionLibraryView = document.getElementById('collection-library-view');
var collectionDetailView  = document.getElementById('collection-detail-view');
var collectionDetailTitle = document.getElementById('collection-detail-title');
var collectionDetailDesc  = document.getElementById('collection-detail-desc');
var backToCollectionsBtn  = document.getElementById('back-to-collections-btn');

var newStoryBtn    = document.getElementById('new-story-btn');
var createStorySec = document.getElementById('create-story');
var cancelStoryBtn = document.getElementById('cancel-story-btn');
var storyForm      = document.getElementById('story-form');
var storyGrid      = document.getElementById('story-grid');

var filterBtns = document.querySelectorAll('.filter-btn');

// ── LOAD DATA ────────────────────────────────────────

var collections        = JSON.parse(localStorage.getItem('shortstories')) || [];
var currentCollectionId = null;
var currentFilter       = 'all';

// ── SAVE ─────────────────────────────────────────────

function save() {
    localStorage.setItem('shortstories', JSON.stringify(collections));
}

// ── SHOW / HIDE COLLECTION FORM ───────────────────────

newCollectionBtn.addEventListener('click', function() {
    createCollectionSec.style.display = 'block';
    newCollectionBtn.style.display = 'none';
});

cancelCollectionBtn.addEventListener('click', function() {
    createCollectionSec.style.display = 'none';
    newCollectionBtn.style.display = 'block';
    collectionForm.reset();
});

// ── CREATE COLLECTION ─────────────────────────────────

collectionForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var collection = {
        id:      Date.now(),
        title:   document.getElementById('collection-title').value,
        desc:    document.getElementById('collection-desc').value,
        stories: []
    };

    collections.push(collection);
    save();
    collectionForm.reset();
    createCollectionSec.style.display = 'none';
    newCollectionBtn.style.display = 'block';
    renderCollections();
});

// ── RENDER COLLECTIONS ────────────────────────────────

function renderCollections() {
    if (collections.length === 0) {
        collectionGrid.innerHTML = '<p class="empty-msg">No collections yet. Start your first anthology.</p>';
        return;
    }

    collectionGrid.innerHTML = '';
    for (var i = 0; i < collections.length; i++) {
        collectionGrid.innerHTML += buildCollectionCard(collections[i]);
    }
}

// ── BUILD COLLECTION CARD ─────────────────────────────

function buildCollectionCard(c) {
    return '<div class="collection-card">'
        + '<h4>' + c.title + '</h4>'
        + '<p>' + (c.desc || 'No description.') + '</p>'
        + '<p>' + c.stories.length + ' stories</p>'
        + '<div class="card-buttons">'
        + '<button onclick="openCollection(' + c.id + ')">Open</button>'
        + '<button class="btn-delete" onclick="deleteCollection(' + c.id + ')">Delete</button>'
        + '</div>'
        + '</div>';
}

// ── OPEN COLLECTION ───────────────────────────────────

function openCollection(id) {
    for (var i = 0; i < collections.length; i++) {
        if (collections[i].id === id) {
            currentCollectionId = id;
            collectionDetailTitle.textContent = collections[i].title;
            collectionDetailDesc.textContent  = collections[i].desc || '';
        }
    }

    currentFilter = 'all';
    resetFilters();
    collectionLibraryView.style.display = 'none';
    collectionDetailView.style.display  = 'block';
    renderStories();
}

// ── BACK TO COLLECTIONS ───────────────────────────────

backToCollectionsBtn.addEventListener('click', function() {
    collectionDetailView.style.display  = 'none';
    collectionLibraryView.style.display = 'block';
    currentCollectionId = null;
    renderCollections();
});

// ── DELETE COLLECTION ─────────────────────────────────

function deleteCollection(id) {
    if (!confirm('Delete this collection and all its stories?')) return;
    var updated = [];
    for (var i = 0; i < collections.length; i++) {
        if (collections[i].id !== id) updated.push(collections[i]);
    }
    collections = updated;
    save();
    renderCollections();
}

// ── FILTER BUTTONS ────────────────────────────────────

for (var i = 0; i < filterBtns.length; i++) {
    filterBtns[i].addEventListener('click', function() {
        currentFilter = this.getAttribute('data-filter');
        resetFilters();
        this.classList.add('active');
        renderStories();
    });
}

function resetFilters() {
    for (var i = 0; i < filterBtns.length; i++) {
        filterBtns[i].classList.remove('active');
    }
    document.querySelector('[data-filter="all"]').classList.add('active');
}

// ── SHOW / HIDE STORY FORM ────────────────────────────

newStoryBtn.addEventListener('click', function() {
    createStorySec.style.display = 'block';
    newStoryBtn.style.display = 'none';
});

cancelStoryBtn.addEventListener('click', function() {
    createStorySec.style.display = 'none';
    newStoryBtn.style.display = 'block';
    storyForm.reset();
});

// ── CREATE STORY ──────────────────────────────────────

storyForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var story = {
        id:       Date.now(),
        title:    document.getElementById('story-title').value,
        genre:    document.getElementById('story-genre').value,
        goal:     parseInt(document.getElementById('story-goal').value),
        notes:    document.getElementById('story-notes').value,
        progress: 0,
        status:   'active',
        log:      []
    };

    for (var i = 0; i < collections.length; i++) {
        if (collections[i].id === currentCollectionId) {
            collections[i].stories.push(story);
        }
    }

    save();
    storyForm.reset();
    createStorySec.style.display = 'none';
    newStoryBtn.style.display = 'block';
    renderStories();
});

// ── RENDER STORIES ────────────────────────────────────

function renderStories() {
    var current = getCurrentCollection();
    if (!current) return;

    var filtered = [];
    for (var i = 0; i < current.stories.length; i++) {
        if (currentFilter === 'all' || current.stories[i].status === currentFilter) {
            filtered.push(current.stories[i]);
        }
    }

    if (filtered.length === 0) {
        storyGrid.innerHTML = '<p class="empty-msg">No stories found.</p>';
        return;
    }

    storyGrid.innerHTML = '';
    for (var i = 0; i < filtered.length; i++) {
        storyGrid.innerHTML += buildStoryCard(filtered[i]);
    }
}

// ── BUILD STORY CARD ──────────────────────────────────

function buildStoryCard(s) {
    var finishBtn = '';
    var abandonBtn = '';

    if (s.status === 'active') {
        finishBtn  = '<button onclick="setStoryStatus(' + s.id + ', \'finished\')">Finish</button>';
        abandonBtn = '<button onclick="setStoryStatus(' + s.id + ', \'abandoned\')">Abandon</button>';
    } else {
        finishBtn = '<button onclick="setStoryStatus(' + s.id + ', \'active\')">Reactivate</button>';
    }

    return '<div class="story-card">'
        + '<h4>' + s.title + '</h4>'
        + '<p class="genre">' + (s.genre || 'No genre') + '</p>'
        + '<p>Daily Goal: ' + s.goal + ' words</p>'
        + '<p>Total Written: ' + s.progress + ' words</p>'
        + '<span class="status-badge">' + s.status + '</span>'
        + '<p>' + (s.notes || '') + '</p>'
        + '<div class="card-buttons">'
        + (s.status !== 'finished' ? '<button onclick="logWords(' + s.id + ')">+ Log Words</button>' : '')
        + finishBtn
        + abandonBtn
        + '<button class="btn-delete" onclick="deleteStory(' + s.id + ')">Delete</button>'
        + '</div>'
        + '</div>';
}

// ── LOG WORDS ─────────────────────────────────────────

function logWords(id) {
    var words = parseInt(prompt('How many words did you write?'));
    if (!words || words < 1) return;

    var date = prompt('Enter the date (e.g. 04/29/2026):');
    if (!date) return;

    for (var i = 0; i < collections.length; i++) {
        if (collections[i].id === currentCollectionId) {
            for (var j = 0; j < collections[i].stories.length; j++) {
                if (collections[i].stories[j].id === id) {
                    collections[i].stories[j].progress += words;
                    collections[i].stories[j].log.push({ words: words, date: date });
                }
            }
        }
    }

    save();
    renderStories();
}

// ── SET STORY STATUS ──────────────────────────────────

function setStoryStatus(id, status) {
    for (var i = 0; i < collections.length; i++) {
        if (collections[i].id === currentCollectionId) {
            for (var j = 0; j < collections[i].stories.length; j++) {
                if (collections[i].stories[j].id === id) {
                    collections[i].stories[j].status = status;
                }
            }
        }
    }
    save();
    renderStories();
}

// ── DELETE STORY ──────────────────────────────────────

function deleteStory(id) {
    if (!confirm('Delete this story?')) return;

    for (var i = 0; i < collections.length; i++) {
        if (collections[i].id === currentCollectionId) {
            var updated = [];
            for (var j = 0; j < collections[i].stories.length; j++) {
                if (collections[i].stories[j].id !== id) updated.push(collections[i].stories[j]);
            }
            collections[i].stories = updated;
        }
    }

    save();
    renderStories();
}

// ── HELPER ───────────────────────────────────────────

function getCurrentCollection() {
    for (var i = 0; i < collections.length; i++) {
        if (collections[i].id === currentCollectionId) return collections[i];
    }
    return null;
}

// ── INIT ─────────────────────────────────────────────

renderCollections();