// Main entry point for the Academic Progression App
// Sets up Express, middleware, routes, and starts the server

// Dependencies
const express = require('express');
const session = require('express-session');
const db = require('./config/db');
require('dotenv').config();

// Route Imports 
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/adminRoutes');
const progressionRoutes = require('./routes/progressionRoutes');
const studentRoutes = require('./routes/studentRoutes');

// App Initialization
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// Session handling
app.use(session({
  secret: 'Secretstring2047', // Just for now, will use a long random string later
  resave: false,
  saveUninitialized: false
}));

app.use(express.static('public'));

app.set('view engine', 'ejs');

const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout'); // This looks for the layout page


// Routes

// Authentication (login, logout)
app.use('/', authRoutes);

// Admin functionality (student/module/grade management)
app.use('/admin', adminRoutes);
app.use('/admin', progressionRoutes); 

// Student portal functionality
app.use('/students', studentRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Academic Progression App is working...');
});

// ====== Server Startup ======
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
