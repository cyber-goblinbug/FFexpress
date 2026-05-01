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

var newIssueBtn     = document.getElementById('new-issue-btn');
var createIssueSec  = document.getElementById('create-issue');
var cancelIssueBtn  = document.getElementById('cancel-issue-btn');
var issueForm       = document.getElementById('issue-form');
var issueGrid       = document.getElementById('issue-grid');

var newArcBtn      = document.getElementById('new-arc-btn');
var createArcSec   = document.getElementById('create-arc');
var cancelArcBtn   = document.getElementById('cancel-arc-btn');
var arcForm        = document.getElementById('arc-form');
var arcGrid        = document.getElementById('arc-grid');

var tabBtns        = document.querySelectorAll('.tab-btn');
var tabIssues      = document.getElementById('tab-issues');
var tabArcs        = document.getElementById('tab-arcs');

// ── LOAD DATA ────────────────────────────────────────

var series          = JSON.parse(localStorage.getItem('comics')) || [];
var currentSeriesId = null;

// ── SAVE ─────────────────────────────────────────────

function save() {
    localStorage.setItem('comics', JSON.stringify(series));
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
        id:      Date.now(),
        title:   document.getElementById('series-title').value,
        genre:   document.getElementById('series-genre').value,
        desc:    document.getElementById('series-desc').value,
        total:   parseInt(document.getElementById('total-issues').value),
        status:  'active',
        issues:  [],
        arcs:    []
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

    activeSeriesGrid.innerHTML    = active.length    ? active.map(buildSeriesCard).join('')    : '<p class="empty-msg">No active series yet.</p>';
    finishedSeriesGrid.innerHTML  = finished.length  ? finished.map(buildSeriesCard).join('')  : '<p class="empty-msg">No finished series yet.</p>';
    abandonedSeriesGrid.innerHTML = abandoned.length ? abandoned.map(buildSeriesCard).join('') : '<p class="empty-msg">No abandoned series.</p>';
}

// ── BUILD SERIES CARD ─────────────────────────────────

function buildSeriesCard(s) {
    var statusBtn = '';
    if (s.status === 'active') {
        statusBtn = '<button onclick="setSeriesStatus(' + s.id + ', \'finished\')">Finish</button>'
                  + '<button onclick="setSeriesStatus(' + s.id + ', \'abandoned\')">Abandon</button>';
    } else {
        statusBtn = '<button onclick="setSeriesStatus(' + s.id + ', \'active\')">Reactivate</button>';
    }

    return '<div class="series-card">'
        + '<h4>' + s.title + '</h4>'
        + '<p>' + (s.genre || 'No genre') + '</p>'
        + '<p>' + s.issues.length + ' / ' + s.total + ' issues</p>'
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
    showTab('issues');
    renderIssues();
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
    if (!confirm('Delete this series and all its issues?')) return;
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
    tabIssues.style.display = tab === 'issues' ? 'block' : 'none';
    tabArcs.style.display   = tab === 'arcs'   ? 'block' : 'none';

    for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove('active');
        if (tabBtns[i].getAttribute('data-tab') === tab) {
            tabBtns[i].classList.add('active');
        }
    }

    if (tab === 'issues') renderIssues();
    if (tab === 'arcs')   renderArcs();
}

// ── SHOW / HIDE ISSUE FORM ────────────────────────────

newIssueBtn.addEventListener('click', function() {
    createIssueSec.style.display = 'block';
    newIssueBtn.style.display = 'none';
});

cancelIssueBtn.addEventListener('click', function() {
    createIssueSec.style.display = 'none';
    newIssueBtn.style.display = 'block';
    issueForm.reset();
});

// ── CREATE ISSUE ──────────────────────────────────────

issueForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var issue = {
        id:     Date.now(),
        number: parseInt(document.getElementById('issue-number').value),
        title:  document.getElementById('issue-title').value,
        pages:  parseInt(document.getElementById('issue-pages').value) || 0,
        panels: parseInt(document.getElementById('issue-panels').value) || 0,
        status: document.getElementById('issue-status').value,
        notes:  document.getElementById('issue-notes').value
    };

    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) {
            series[i].issues.push(issue);
        }
    }

    save();
    issueForm.reset();
    createIssueSec.style.display = 'none';
    newIssueBtn.style.display = 'block';
    renderIssues();
});

// ── RENDER ISSUES ─────────────────────────────────────

function renderIssues() {
    var current = getCurrentSeries();
    if (!current) return;

    if (current.issues.length === 0) {
        issueGrid.innerHTML = '<p class="empty-msg">No issues added yet.</p>';
        return;
    }

    issueGrid.innerHTML = '';
    for (var i = 0; i < current.issues.length; i++) {
        issueGrid.innerHTML += buildIssueCard(current.issues[i]);
    }
}

// ── BUILD ISSUE CARD ──────────────────────────────────

function buildIssueCard(issue) {
    return '<div class="issue-card">'
        + '<h4>#' + issue.number + ' — ' + (issue.title || 'Untitled') + '</h4>'
        + '<p>Pages: ' + issue.pages + ' &nbsp;|&nbsp; Panels: ' + issue.panels + '</p>'
        + '<span class="status-badge">' + issue.status + '</span>'
        + '<p>' + (issue.notes || '') + '</p>'
        + '<div class="card-buttons">'
        + '<button class="btn-delete" onclick="deleteIssue(' + issue.id + ')">Delete</button>'
        + '</div>'
        + '</div>';
}

// ── DELETE ISSUE ──────────────────────────────────────

function deleteIssue(id) {
    if (!confirm('Delete this issue?')) return;
    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) {
            var updated = [];
            for (var j = 0; j < series[i].issues.length; j++) {
                if (series[i].issues[j].id !== id) updated.push(series[i].issues[j]);
            }
            series[i].issues = updated;
        }
    }
    save();
    renderIssues();
}

// ── SHOW / HIDE ARC FORM ──────────────────────────────

newArcBtn.addEventListener('click', function() {
    createArcSec.style.display = 'block';
    newArcBtn.style.display = 'none';
});

cancelArcBtn.addEventListener('click', function() {
    createArcSec.style.display = 'none';
    newArcBtn.style.display = 'block';
    arcForm.reset();
});

// ── CREATE ARC ────────────────────────────────────────

arcForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var arc = {
        id:     Date.now(),
        title:  document.getElementById('arc-title').value,
        issues: document.getElementById('arc-issues').value,
        notes:  document.getElementById('arc-notes').value,
        status: document.getElementById('arc-status').value
    };

    for (var i = 0; i < series.length; i++) {
        if (series[i].id === currentSeriesId) {
            series[i].arcs.push(arc);
        }
    }

    save();
    arcForm.reset();
    createArcSec.style.display = 'none';
    newArcBtn.style.display = 'block';
    renderArcs();
});

// ── RENDER ARCS ───────────────────────────────────────

function renderArcs() {
    var current = getCurrentSeries();
    if (!current) return;

    if (current.arcs.length === 0) {
        arcGrid.innerHTML = '<p class="empty-msg">No arcs added yet.</p>';
        return;
    }

    arcGrid.innerHTML = '';
    for (var i = 0; i < current.arcs.length; i++) {
        arcGrid.innerHTML += buildArcCard(current.arcs[i]);
    }
}

// ── BUILD ARC CARD ────────────────────────────────────

function buildArcCard(arc) {
    return '<div class="arc-card">'
        + '<h4>' + arc.title + '</h4>'
        + '<p>Issues: ' + (arc.issues || 'N/A') + '</p>'
        + '<span class="status-badge">' + arc.status + '</span>'
        + '<p>' + (arc.notes || '') + '</p>'
        + '<div class="card-buttons">'
        + '<button class="btn-delete" onclick="deleteArc(' + arc.id + ')">Delete</button>'
        + '</div>'
        + '</div>';
}

// ── DELETE ARC ────────────────────────────────────────

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