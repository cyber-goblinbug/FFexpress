var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
const Sequelize = require('sequelize');
const DataTypes = require('sequelize');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layout' });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Register Partials
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Setup Database
const dataDirectory = path.join(__dirname, 'data');
const storage = path.join(dataDirectory, 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: require('sqlite3'),
  storage,
  logging: true
});

// Writing Entry Model
const Entry = sequelize.define('Entry', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  wordCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

async function syncDB() {
  await sequelize.sync();
}
syncDB().catch(console.error);

// ── Routes ──────────────────────────────────────────────

// Home — list all entries
app.get('/', async (req, res) => {
  try {
    const entries = await Entry.findAll({ order: [['date', 'DESC']] });
    const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0);
    res.render('index', {
      title: 'Home',
      entries: entries.map(e => e.toJSON()),
      totalWords
    });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// Show form to add a new entry
app.get('/entries/new', (req, res) => {
  res.render('new-entry', { title: 'Log Writing Session' });
});

// Create a new entry
app.post('/entries', async (req, res) => {
  try {
    const { title, wordCount, genre, notes, date } = req.body;
    await Entry.create({ title, wordCount, genre, notes, date });
    res.redirect('/');
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// Show a single entry
app.get('/entries/:id', async (req, res) => {
  try {
    const entry = await Entry.findByPk(req.params.id);
    if (!entry) return res.status(404).render('error', { message: 'Entry not found' });
    res.render('entry', { title: entry.title, entry: entry.toJSON() });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// Show edit form
app.get('/entries/:id/edit', async (req, res) => {
  try {
    const entry = await Entry.findByPk(req.params.id);
    if (!entry) return res.status(404).render('error', { message: 'Entry not found' });
    res.render('edit-entry', { title: 'Edit Entry', entry: entry.toJSON() });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// Update an entry
app.post('/entries/:id/edit', async (req, res) => {
  try {
    const entry = await Entry.findByPk(req.params.id);
    if (!entry) return res.status(404).render('error', { message: 'Entry not found' });
    const { title, wordCount, genre, notes, date } = req.body;
    await entry.update({ title, wordCount, genre, notes, date });
    res.redirect('/');
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// Delete an entry
app.post('/entries/:id/delete', async (req, res) => {
  try {
    const entry = await Entry.findByPk(req.params.id);
    if (!entry) return res.status(404).render('error', { message: 'Entry not found' });
    await entry.destroy();
    res.redirect('/');
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// ── Error Handling ───────────────────────────────────────

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;