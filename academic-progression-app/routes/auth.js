const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// gets the Login page
router.get('/login', (req, res) => {
    res.render('login', { error: null, title: 'Login' });
});

// Handles the POST request for user login. 
// Extracts username and password from the request body, then verifies the credentials against the database created.
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Checks user in DB
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.render('login', { error: 'Something went wrong', title: 'Login' });
        }

        if (results.length === 0) {
            return res.render('login', { error: 'Invalid credentials', title: 'Login' });
        }

        const user = results[0];

        // Compares entered password with the hashed password in the database.
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            // Login success, stores user in the session
            req.session.user = {
                id: user.user_id,
                username: user.username,
                role: user.role,
                student_id: user.student_id,
            };
            // Redirects to the dashboard after successful login
            // Sends to the relevant page depending on whether they're an admin or a student.
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/students/dashboard');
            }


        } else {
            res.render('login', { error: 'Invalid credentials', title: 'Login' });
        }
    });
});

// gets the logout page
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.redirect('/login'); // successful logout so goes back to the login page
    });
});

module.exports = router;
