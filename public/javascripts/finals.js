// ── GET PAGE ELEMENTS ────────────────────────────────

var newBtn        = document.getElementById('new-project-btn');
var createSection = document.getElementById('create-project');
var cancelBtn     = document.getElementById('cancel-btn');
var form          = document.getElementById('project-form');
var activeGrid    = document.getElementById('active-projects');
var finishedGrid  = document.getElementById('finished-projects');
var abandonedGrid = document.getElementById('abandoned-projects');

// ── LOAD SAVED PROJECTS ──────────────────────────────

var projects = JSON.parse(localStorage.getItem('novels')) || [];

// ── CHART SETUP ──────────────────────────────────────

var ctx = document.getElementById('progress-chart').getContext('2d');

var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Word Count Progress'
            }
        },
        scales: {
            y: {
                min: 0,
                title: {
                    display: true,
                    text: 'Words Written'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Entry / Day'
                }
            }
        }
    }
});

// ── UPDATE CHART ─────────────────────────────────────

function updateChart() {

    // Clear old data
    chart.data.datasets = [];
    chart.data.labels   = [];

    // Only show active projects
    var active = [];
    for (var i = 0; i < projects.length; i++) {
        if (projects[i].status === 'active') {
            active.push(projects[i]);
        }
    }

    // Find how many log entries the longest project has
    var maxLogs = 0;
    for (var i = 0; i < active.length; i++) {
        if (active[i].log.length > maxLogs) {
            maxLogs = active[i].log.length;
        }
    }

    // Set x-axis labels using date or entry number
    for (var i = 0; i < maxLogs; i++) {
        chart.data.labels.push('Entry ' + (i + 1));
    }

    // Find the highest goal to set y-axis max
    var maxGoal = 0;
    for (var i = 0; i < active.length; i++) {
        if (active[i].goal > maxGoal) {
            maxGoal = active[i].goal;
        }
    }
    chart.options.scales.y.max = maxGoal;

    // Add one line per active project
    for (var i = 0; i < active.length; i++) {
        var p = active[i];

        // Build cumulative word totals and use date as label if available
        var dataPoints = [];
        var total = 0;
        for (var j = 0; j < p.log.length; j++) {
            total += p.log[j].words;
            dataPoints.push(total);
            // Update label to use the date from the log entry
            chart.data.labels[j] = p.log[j].date || 'Entry ' + (j + 1);
        }

        chart.data.datasets.push({
            label: p.title,
            data: dataPoints,
            borderColor: p.color,
            backgroundColor: p.color,
            tension: 0.3,
            fill: false
        });
    }

    chart.update();
}

// ── SHOW FORM ────────────────────────────────────────

newBtn.addEventListener('click', function() {
    createSection.style.display = 'block';
    newBtn.style.display = 'none';
});

// ── HIDE FORM ────────────────────────────────────────

cancelBtn.addEventListener('click', function() {
    createSection.style.display = 'none';
    newBtn.style.display = 'block';
    form.reset();
});

// ── CREATE PROJECT ───────────────────────────────────

form.addEventListener('submit', function(e) {
    e.preventDefault();

    var project = {
        id:       Date.now(),
        title:    document.getElementById('title').value,
        genre:    document.getElementById('genre').value,
        goal:     parseInt(document.getElementById('goal').value),  // daily word count goal
        progress: 0,
        status:   'active',
        color:    'rgb(' + Math.floor(Math.random()*200) + ',' + Math.floor(Math.random()*200) + ',' + Math.floor(Math.random()*200) + ')',
        log:      []
    };

    projects.push(project);
    save();
    form.reset();
    createSection.style.display = 'none';
    newBtn.style.display = 'block';
    renderProjects();
});

// ── RENDER PROJECTS ──────────────────────────────────

function renderProjects() {
    var active    = [];
    var finished  = [];
    var abandoned = [];

    for (var i = 0; i < projects.length; i++) {
        if (projects[i].status === 'active') {
            active.push(projects[i]);
        } else if (projects[i].status === 'finished') {
            finished.push(projects[i]);
        } else {
            abandoned.push(projects[i]);
        }
    }

    if (active.length === 0) {
        activeGrid.innerHTML = '<p class="empty-msg">No active novels yet.</p>';
    } else {
        activeGrid.innerHTML = '';
        for (var i = 0; i < active.length; i++) {
            activeGrid.innerHTML += buildCard(active[i]);
        }
    }

    if (finished.length === 0) {
        finishedGrid.innerHTML = '<p class="empty-msg">No finished novels yet.</p>';
    } else {
        finishedGrid.innerHTML = '';
        for (var i = 0; i < finished.length; i++) {
            finishedGrid.innerHTML += buildCard(finished[i]);
        }
    }

    if (abandoned.length === 0) {
        abandonedGrid.innerHTML = '<p class="empty-msg">No abandoned novels.</p>';
    } else {
        abandonedGrid.innerHTML = '';
        for (var i = 0; i < abandoned.length; i++) {
            abandonedGrid.innerHTML += buildCard(abandoned[i]);
        }
    }

    updateChart();
}

// ── BUILD A PROJECT CARD ─────────────────────────────

function buildCard(p) {
    var pct = Math.round((p.progress / p.goal) * 100);
    if (pct > 100) pct = 100;

    var abandonBtn = '';
    if (p.status === 'active') {
        abandonBtn = '<button onclick="toggleStatus(' + p.id + ', \'abandoned\')">Abandon</button>';
    } else if (p.status === 'abandoned') {
        abandonBtn = '<button onclick="toggleStatus(' + p.id + ', \'active\')">Reactivate</button>';
    }

    var finishBtn = '';
    if (p.status === 'active') {
        finishBtn = '<button onclick="toggleStatus(' + p.id + ', \'finished\')">Finished</button>';
    } else if (p.status === 'finished') {
        finishBtn = '<button onclick="toggleStatus(' + p.id + ', \'active\')">Reactivate</button>';
    }

    var logBtn = '';
    if (p.status !== 'finished') {
        logBtn = '<button onclick="logProgress(' + p.id + ')">+ Log Words</button>';
    }

    return '<div class="project-card">'
        + '<h4>' + p.title + '</h4>'
        + '<p class="genre">' + (p.genre || 'No genre listed') + '</p>'
        + '<p>Daily Goal: ' + p.goal + ' words</p>'
        + '<p>Total Written: ' + p.progress + ' words</p>'
        + '<div class="card-buttons">'
        + logBtn
        + finishBtn
        + abandonBtn
        + '<button onclick="deleteProject(' + p.id + ')">Delete</button>'
        + '</div>'
        + '</div>';
}

// ── LOG WORDS ────────────────────────────────────────

function logProgress(id) {
    var words = parseInt(prompt('How many words did you write?'));
    if (!words || words < 1) return;

    var date = prompt('Enter the date (e.g. 04/29/2026):');
    if (!date) return;

    for (var i = 0; i < projects.length; i++) {
        if (projects[i].id === id) {
            projects[i].progress += words;
            projects[i].log.push({ words: words, date: date });
        }
    }

    save();
    renderProjects();
}

// ── ABANDON OR REACTIVATE ────────────────────────────

function toggleStatus(id, newStatus) {
    for (var i = 0; i < projects.length; i++) {
        if (projects[i].id === id) {
            projects[i].status = newStatus;
        }
    }
    save();
    renderProjects();
}

// ── DELETE PROJECT ───────────────────────────────────

function deleteProject(id) {
    if (!confirm('Delete this novel?')) return;

    var updated = [];
    for (var i = 0; i < projects.length; i++) {
        if (projects[i].id !== id) {
            updated.push(projects[i]);
        }
    }
    projects = updated;
    save();
    renderProjects();
}

// ── SAVE TO LOCALSTORAGE ─────────────────────────────

function save() {
    localStorage.setItem('novels', JSON.stringify(projects));
}

// ── START ────────────────────────────────────────────

renderProjects();