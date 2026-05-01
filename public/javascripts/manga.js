// ── GET PAGE ELEMENTS ────────────────────────────────

var newSeriesBtn     = document.getElementById('new-series-btn');
var createSeriesSec  = document.getElementById('create-series');
var cancelSeriesBtn  = document.getElementById('cancel-series-btn');
var seriesForm       = document.getElementById('series-form');

var seriesLibraryView = document.getElementById('series-library-view');
var seriesDetailView  = document.getElementById('series-detail-view');
var seriesDetailTitle = document.getElementById('series-detail-title');
var seriesDetailDesc  = document.getElementById('series-detail-desc');
var backToSeriesBtn   = document.getElementById('back-to-series-btn');

var activeSeriesGrid    = document.getElementById('active-series');
var finishedSeriesGrid  = document.getElementById('finished-series');
var abandonedSeriesGrid = document.getElementById('abandoned-series');

var newChapterBtn    = document.getElementById('new-chapter-btn');
var createChapterSec = document.getElementById('create-chapter');
var cancelChapterBtn = document.getElementById('cancel-chapter-btn');
var chapterForm      = document.getElementById('chapter-form');
var chapterGrid      = document.getElementById('chapter-grid');

var newVolumeBtn    = document.getElementById('new-volume-btn');
var createVolumeSec = document.getElementById('create-volume');
var cancelVolumeBtn = document.getElementById('cancel-volume-btn');
var volumeForm      = document.getElementById('volume-form');
var volumeGrid      = document.getElementById('volume-grid');

var newArcBtn      = document.getElementById('new-arc-btn');
var createArcSec   = document.getElementById('create-arc');
var cancelArcBtn   = document.getElementById('cancel-arc-btn');
var arcForm        = document.getElementById('arc-form');
var arcGrid        = document.getElementById('arc-grid');

var tabBtns      = document.querySelectorAll('.tab-btn');
var tabChapters  = document.getElementById('tab-chapters');
var tabVolumes   = document.getElementById('tab-volumes');
var tabArcs      = document.getElementById('tab-arcs');

// ── LOAD DATA ────────────────────────────────────────

var series          = JSON.parse(localStorage.getItem('manga')) || [];
var currentSeriesId = null;

// ── SAVE ─────────────────────────────────────────────

function save() {
    localStorage.setItem('manga', JSON.stringify(series));
}

// ── SHOW / HIDE SERIES FORM ───────────────────────────

newSeriesBtn.addEventListener('click', function() {
    createSeriesSec.style.display = 'block';
    newSeriesBtn.style.display = 'none';
});

cancelSeriesBtn.addEventListener('click', function() {
    createSeriesSec.style.display = 'none';
    newSeriesBtn.style.display = 'block';
    seriesForm.reset();
});

// ── CREATE SERIES ─────────────────────────────────────

seriesForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var s = {
        id:        Date.now(),
        title:     document.getElementById('series-title').value,
        genre:     document.getElementById('series-genre').value,
        direction: document.getElementById('reading-direction').value,
        desc:      document.getElementById('series-desc').value,
        volumes:   parseInt(document.getElementById('total-volumes').value) || 0,
        status:    'active',
        chapters:  [],
        vols:      [],
        arcs:      []
    };

    series.push(s);
    save();
    seriesForm.reset();
    createSeriesSec.style.display = 'none';
    newSeriesBtn.style.display = 'block';
    renderSeriesLibrary();
});

// ── RENDER SERIES LIBRARY ─────────────────────────────

function renderSeriesLibrary() {
    var active = [], finished = [], abandoned = [];

    for (var i = 0; i < series.length; i++) {
        if (series[i].status === 'active')        active.push(series[i]);
        else if (series[i].status === 'finished') finished.push(series[i]);
        else                                      abandoned.push(series[i]);
    }

    activeSeriesGrid.innerHTML    = active.length    ? active.map(buildSeriesCard).join('')    : '<p class="empty-msg">No ongoing series yet.</p>';
    finishedSeriesGrid.innerHTML  = finished.length  ? finished.map(buildSeriesCard).join('')  : '<p class="empty-msg">No completed series yet.</p>';
    abandonedSeriesGrid.innerHTML = abandoned.length ? abandoned.map(buildSeriesCard).join('') : '<p class="empty-msg">No dropped series.</p>';
}

// ── BUILD SERIES CARD ─────────────────────────────────

function buildSeriesCard(s) {
    var statusBtn = '';
    if (s.status === 'active') {
        statusBtn = '<button onclick="setSeriesStatus(' + s.id + ', \'finished\')">Complete</button>'
                  + '<button onclick="setSeriesStatus(' + s.id + ', \'abandoned\')">Drop</button>';
    } else {
        statusBtn = '<button onclick="setSeriesStatus(' + s.id + ', \'active\')">Reactivate</button>';
    }

    return '<div class="series-card">'
        + '<h4>' + s.title + '</h4>'
        + '<p>' + (s.genre || 'No genre') + ' &nbsp;|&nbsp; ' + s.direction + '</p>'
        + '<p>' + s.chapters.length + ' chapters</p>'
        + '<div class="card-buttons">'
        + '<button onclick="openSeries(' + s.id + ')">Open</button>'
        + statusBtn
        + '<button class="btn-delete" onclick="deleteSeries(' + s.id + ')">Delete</button>'
        + '</div>'
        + '</div>';
}

// ── OPEN SERIES ───────────────────────────────────────

function openSeries(id) {
    for (var i = 0; i < series.length; i++) {
        if (series[i].id === id) {
            currentSeriesId = id;
            seriesDetailTitle.textContent = series[i].title;
            seriesDetailDesc.textContent  = series[i].desc || '';
        }
    }

    seriesLibraryView.style.display = 'none';
    seriesDetailView.style.display  = 'block';
    showTab('chapters');
}

// ── BACK TO SERIES ────────────────────────────────────

backToSeriesBtn.addEventListener('click', function() {
    seriesDetailView.style.display  = 'none';
    seriesLibraryView.style.display = 'block';
    currentSeriesId = null;
    renderSeriesLibrary();
});

// ── SET SERIES STATUS ─────────────────────────────────

function setSeriesStatus(id, status) {
    for (var i = 0; i < series.length; i++) {
        if (series[i].id === id) series[i].status = status;
    }
    save();
    renderSeriesLibrary();
}

// ── DELETE SERIES ─────────────────────────────────────

function deleteSeries(id) {
    if (!confirm('Delete this series and all its data?')) return;
    var updated = [];
    for (var i = 0; i < series.length; i++) {
        if (series[i].id !== id) updated.push(series[i]);
    }
    series = updated;
    save();
    renderSeriesLibrary();
}

// ── TABS ──────────────────────────────────────────────

for (var i = 0; i < tabBtns.length; i++) {
    tabBtns[i].addEventListener('click', function() {
        showTab(this.getAttribute('data-tab'));
    });
}

function showTab(tab) {
    tabChapters.style.display = tab === 'chapters' ? 'block' : 'none';
    tabVolumes.style.display  = tab === 'volumes'  ? 'block' : 'none';
    tabArcs.style.display     = tab === 'arcs'     ? 'block' : 'none';

    for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove('active');
        if (tabBtns[i].getAttribute('data-tab') === tab) {
            tabBtns[i].classList.add('active');
        }
    }

    if (tab === 'chapters') renderChapters();
    if (tab === 'volumes')  renderVolumes();
    if (tab === 'arcs')     renderArcs();
}

// ── CHAPTER FORM ──────────────────────────────────────

newChapterBtn.addEventListener('click', function() {
    createChapterSec.style.display = 'block';
    newChapterBtn.style.display = 'none';
});

cancelChapterBtn.addEventListener('click', function() {
    createChapterSec.style.display = 'none';
    newChapterBtn.style.display = 'block';
    chapterForm.reset();
});

chapterForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var chapter = {
        id:     Date.now(),
        number: parseInt(document.getElementById('chapter-number').value),
        title:  document.getElementById('chapter-title').value,
        pages:  parseInt(document.getElementById('chapter-pages').value) || 0,
        panels: parseInt(document.getElementById('chapter-panels').value) || 0,
        status: document.getElementById('chapter-status').value,
        notes:  document.getElementById('chapter-notes').value
    };

    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) series[i].chapters.push(chapter);
    }

    save();
    chapterForm.reset();
    createChapterSec.style.display = 'none';
    newChapterBtn.style.display = 'block';
    renderChapters();
});

function renderChapters() {
    var current = getCurrentSeries();
    if (!current) return;

    if (current.chapters.length === 0) {
        chapterGrid.innerHTML = '<p class="empty-msg">No chapters added yet.</p>';
        return;
    }

    chapterGrid.innerHTML = '';
    for (var i = 0; i < current.chapters.length; i++) {
        var ch = current.chapters[i];
        chapterGrid.innerHTML += '<div class="chapter-card">'
            + '<h4>Ch. ' + ch.number + ' — ' + (ch.title || 'Untitled') + '</h4>'
            + '<p>Pages: ' + ch.pages + ' &nbsp;|&nbsp; Panels: ' + ch.panels + '</p>'
            + '<span class="status-badge status-' + ch.status + '">' + ch.status + '</span>'
            + '<p>' + (ch.notes || '') + '</p>'
            + '<div class="card-buttons">'
            + '<button class="btn-delete" onclick="deleteChapter(' + ch.id + ')">Delete</button>'
            + '</div></div>';
    }
}

function deleteChapter(id) {
    if (!confirm('Delete this chapter?')) return;
    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) {
            var updated = [];
            for (var j = 0; j < series[i].chapters.length; j++) {
                if (series[i].chapters[j].id !== id) updated.push(series[i].chapters[j]);
            }
            series[i].chapters = updated;
        }
    }
    save();
    renderChapters();
}

// ── VOLUME FORM ───────────────────────────────────────

newVolumeBtn.addEventListener('click', function() {
    createVolumeSec.style.display = 'block';
    newVolumeBtn.style.display = 'none';
});

cancelVolumeBtn.addEventListener('click', function() {
    createVolumeSec.style.display = 'none';
    newVolumeBtn.style.display = 'block';
    volumeForm.reset();
});

volumeForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var vol = {
        id:       Date.now(),
        number:   parseInt(document.getElementById('volume-number').value),
        chapters: document.getElementById('volume-chapters').value,
        status:   document.getElementById('volume-status').value
    };

    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) series[i].vols.push(vol);
    }

    save();
    volumeForm.reset();
    createVolumeSec.style.display = 'none';
    newVolumeBtn.style.display = 'block';
    renderVolumes();
});

function renderVolumes() {
    var current = getCurrentSeries();
    if (!current) return;

    if (current.vols.length === 0) {
        volumeGrid.innerHTML = '<p class="empty-msg">No volumes added yet.</p>';
        return;
    }

    volumeGrid.innerHTML = '';
    for (var i = 0; i < current.vols.length; i++) {
        var v = current.vols[i];
        volumeGrid.innerHTML += '<div class="volume-card">'
            + '<h4>Vol. ' + v.number + '</h4>'
            + '<p>Chapters: ' + (v.chapters || 'N/A') + '</p>'
            + '<span class="status-badge status-' + v.status + '">' + v.status + '</span>'
            + '<div class="card-buttons">'
            + '<button class="btn-delete" onclick="deleteVolume(' + v.id + ')">Delete</button>'
            + '</div></div>';
    }
}

function deleteVolume(id) {
    if (!confirm('Delete this volume?')) return;
    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) {
            var updated = [];
            for (var j = 0; j < series[i].vols.length; j++) {
                if (series[i].vols[j].id !== id) updated.push(series[i].vols[j]);
            }
            series[i].vols = updated;
        }
    }
    save();
    renderVolumes();
}

// ── ARC FORM ──────────────────────────────────────────

newArcBtn.addEventListener('click', function() {
    createArcSec.style.display = 'block';
    newArcBtn.style.display = 'none';
});

cancelArcBtn.addEventListener('click', function() {
    createArcSec.style.display = 'none';
    newArcBtn.style.display = 'block';
    arcForm.reset();
});

arcForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var arc = {
        id:       Date.now(),
        title:    document.getElementById('arc-title').value,
        chapters: document.getElementById('arc-chapters').value,
        notes:    document.getElementById('arc-notes').value,
        status:   document.getElementById('arc-status').value
    };

    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) series[i].arcs.push(arc);
    }

    save();
    arcForm.reset();
    createArcSec.style.display = 'none';
    newArcBtn.style.display = 'block';
    renderArcs();
});

function renderArcs() {
    var current = getCurrentSeries();
    if (!current) return;

    if (current.arcs.length === 0) {
        arcGrid.innerHTML = '<p class="empty-msg">No arcs added yet.</p>';
        return;
    }

    arcGrid.innerHTML = '';
    for (var i = 0; i < current.arcs.length; i++) {
        var arc = current.arcs[i];
        arcGrid.innerHTML += '<div class="arc-card">'
            + '<h4>' + arc.title + '</h4>'
            + '<p>Chapters: ' + (arc.chapters || 'N/A') + '</p>'
            + '<span class="status-badge status-' + arc.status + '">' + arc.status + '</span>'
            + '<p>' + (arc.notes || '') + '</p>'
            + '<div class="card-buttons">'
            + '<button class="btn-delete" onclick="deleteArc(' + arc.id + ')">Delete</button>'
            + '</div></div>';
    }
}

function deleteArc(id) {
    if (!confirm('Delete this arc?')) return;
    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) {
            var updated = [];
            for (var j = 0; j < series[i].arcs.length; j++) {
                if (series[i].arcs[j].id !== id) updated.push(series[i].arcs[j]);
            }
            series[i].arcs = updated;
        }
    }
    save();
    renderArcs();
}

// ── HELPER ───────────────────────────────────────────

function getCurrentSeries() {
    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) return series[i];
    }
    return null;
}

// ── INIT ─────────────────────────────────────────────

renderSeriesLibrary();