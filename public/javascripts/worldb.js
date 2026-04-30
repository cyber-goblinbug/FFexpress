// ── GET PAGE ELEMENTS ────────────────────────────────

var worldLibraryView = document.getElementById('world-library-view');
var worldDetailView  = document.getElementById('world-detail-view');

var newWorldBtn      = document.getElementById('new-world-btn');
var createWorldSec   = document.getElementById('create-world');
var cancelWorldBtn   = document.getElementById('cancel-world-btn');
var worldForm        = document.getElementById('world-form');
var worldGrid        = document.getElementById('world-grid');

var worldDetailTitle = document.getElementById('world-detail-title');
var worldDetailDesc  = document.getElementById('world-detail-desc');
var backToWorldsBtn  = document.getElementById('back-to-worlds-btn');

var newEntryBtn      = document.getElementById('new-entry-btn');
var createEntrySec   = document.getElementById('create-entry');
var cancelEntryBtn   = document.getElementById('cancel-entry-btn');
var entryForm        = document.getElementById('entry-form');
var entryGrid        = document.getElementById('entry-grid');

var filterButtons    = document.querySelectorAll('.filter-btn');

// ── LOAD DATA ────────────────────────────────────────

var worlds          = JSON.parse(localStorage.getItem('worlds')) || [];
var currentWorldId  = null;
var currentFilter   = 'all';

// ── SAVE ─────────────────────────────────────────────

function save() {
    localStorage.setItem('worlds', JSON.stringify(worlds));
}

// ── SHOW / HIDE WORLD FORM ────────────────────────────

newWorldBtn.addEventListener('click', function() {
    createWorldSec.style.display = 'block';
    newWorldBtn.style.display = 'none';
});

cancelWorldBtn.addEventListener('click', function() {
    createWorldSec.style.display = 'none';
    newWorldBtn.style.display = 'block';
    worldForm.reset();
});

// ── CREATE WORLD ─────────────────────────────────────

worldForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var world = {
        id:      Date.now(),
        name:    document.getElementById('world-name').value,
        desc:    document.getElementById('world-desc').value,
        entries: []
    };

    worlds.push(world);
    save();
    worldForm.reset();
    createWorldSec.style.display = 'none';
    newWorldBtn.style.display = 'block';
    renderWorlds();
});

// ── RENDER WORLD LIBRARY ──────────────────────────────

function renderWorlds() {
    if (worlds.length === 0) {
        worldGrid.innerHTML = '<p class="empty-msg">No worlds created yet. Begin your first.</p>';
        return;
    }

    worldGrid.innerHTML = '';
    for (var i = 0; i < worlds.length; i++) {
        worldGrid.innerHTML += buildWorldCard(worlds[i]);
    }
}

// ── BUILD WORLD CARD ──────────────────────────────────

function buildWorldCard(w) {
    return '<div class="world-card">'
        + '<h4>' + w.name + '</h4>'
        + '<p class="world-desc">' + (w.desc || 'No description.') + '</p>'
        + '<p class="entry-count">' + w.entries.length + ' entries</p>'
        + '<div class="card-buttons">'
        + '<button onclick="openWorld(' + w.id + ')">Open</button>'
        + '<button class="btn-delete" onclick="deleteWorld(' + w.id + ')">Delete</button>'
        + '</div>'
        + '</div>';
}

// ── OPEN A WORLD ──────────────────────────────────────

function openWorld(id) {
    for (var i = 0; i < worlds.length; i++) {
        if (worlds[i].id === id) {
            currentWorldId = id;
            worldDetailTitle.textContent = worlds[i].name;
            worldDetailDesc.textContent  = worlds[i].desc || '';
        }
    }

    currentFilter = 'all';
    resetFilterButtons();
    worldLibraryView.style.display = 'none';
    worldDetailView.style.display  = 'block';
    renderEntries();
}

// ── BACK TO WORLDS ────────────────────────────────────

backToWorldsBtn.addEventListener('click', function() {
    worldDetailView.style.display  = 'none';
    worldLibraryView.style.display = 'block';
    currentWorldId = null;
    renderWorlds();
});

// ── DELETE WORLD ──────────────────────────────────────

function deleteWorld(id) {
    if (!confirm('Delete this world and all its entries?')) return;

    var updated = [];
    for (var i = 0; i < worlds.length; i++) {
        if (worlds[i].id !== id) {
            updated.push(worlds[i]);
        }
    }
    worlds = updated;
    save();
    renderWorlds();
}

// ── SHOW / HIDE ENTRY FORM ────────────────────────────

newEntryBtn.addEventListener('click', function() {
    createEntrySec.style.display = 'block';
    newEntryBtn.style.display = 'none';
});

cancelEntryBtn.addEventListener('click', function() {
    createEntrySec.style.display = 'none';
    newEntryBtn.style.display = 'block';
    entryForm.reset();
});

// ── CREATE ENTRY ──────────────────────────────────────

entryForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var entry = {
        id:       Date.now(),
        title:    document.getElementById('entry-title').value,
        category: document.getElementById('category').value,
        notes:    document.getElementById('entry-notes').value,
        status:   document.getElementById('entry-status').value
    };

    for (var i = 0; i < worlds.length; i++) {
        if (worlds[i].id === currentWorldId) {
            worlds[i].entries.push(entry);
        }
    }

    save();
    entryForm.reset();
    createEntrySec.style.display = 'none';
    newEntryBtn.style.display = 'block';
    renderEntries();
});

// ── FILTER BUTTONS ────────────────────────────────────

for (var i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener('click', function() {
        currentFilter = this.getAttribute('data-filter');
        resetFilterButtons();
        this.classList.add('active');
        renderEntries();
    });
}

function resetFilterButtons() {
    for (var i = 0; i < filterButtons.length; i++) {
        filterButtons[i].classList.remove('active');
    }
    // set All button active by default
    document.querySelector('[data-filter="all"]').classList.add('active');
}

// ── RENDER ENTRIES ────────────────────────────────────

function renderEntries() {
    var currentWorld = null;
    for (var i = 0; i < worlds.length; i++) {
        if (worlds[i].id === currentWorldId) {
            currentWorld = worlds[i];
        }
    }
    if (!currentWorld) return;

    var entries = currentWorld.entries;

    // Apply filter
    var filtered = [];
    for (var i = 0; i < entries.length; i++) {
        if (currentFilter === 'all' || entries[i].category === currentFilter) {
            filtered.push(entries[i]);
        }
    }

    if (filtered.length === 0) {
        entryGrid.innerHTML = '<p class="empty-msg">No entries found.</p>';
        return;
    }

    entryGrid.innerHTML = '';
    for (var i = 0; i < filtered.length; i++) {
        entryGrid.innerHTML += buildEntryCard(filtered[i]);
    }
}

// ── BUILD ENTRY CARD ──────────────────────────────────

function buildEntryCard(e) {
    return '<div class="entry-card">'
        + '<h4>' + e.title + '</h4>'
        + '<p class="entry-category">' + e.category + '</p>'
        + '<p class="entry-notes">' + (e.notes || '') + '</p>'
        + '<span class="status-badge status-' + e.status + '">' + e.status + '</span>'
        + '<div class="card-buttons">'
        + '<button class="btn-delete" onclick="deleteEntry(' + e.id + ')">Delete</button>'
        + '</div>'
        + '</div>';
}

// ── DELETE ENTRY ──────────────────────────────────────

function deleteEntry(id) {
    if (!confirm('Delete this entry?')) return;

    for (var i = 0; i < worlds.length; i++) {
        if (worlds[i].id === currentWorldId) {
            var updated = [];
            for (var j = 0; j < worlds[i].entries.length; j++) {
                if (worlds[i].entries[j].id !== id) {
                    updated.push(worlds[i].entries[j]);
                }
            }
            worlds[i].entries = updated;
        }
    }

    save();
    renderEntries();
}

// ── INIT ─────────────────────────────────────────────

renderWorlds();