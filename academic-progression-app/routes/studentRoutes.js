const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get data from all students
router.get('/', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Show the form to add a new module
router.get('/modules/add', (req, res) => {
  res.render('admin/addModule');
});

// Code that handles adding a new module
router.post('/modules/add', (req, res) => {
  const { subj_code, catalog_number, title, credit_count, semester } = req.body;

  // SQL query that will insert a new module into the modules table in the DB
  const query = `
    INSERT INTO modules (subj_code, catalog_number, title, credit_count, semester)
    VALUES (?, ?, ?, ?, ?)
  `;

  // Executes the query using the values from the form submission
  db.query(query, [subj_code, catalog_number, title, credit_count, semester], (err, result) => {
    if (err) {
      console.error('Error inserting module:', err);
      return res.status(500).send('Failed to add module');
    }
    // Redirects to the modules page after the insert is successful
    res.redirect('/admin/modules');
  });
});

// Student dashboard - shows dashboard for logged-in student
router.get('/dashboard', (req, res) => {
  const studentId = req.session.user?.student_id;

  if (!studentId) {
    return res.redirect('/login'); // Redirects to the login page if the student is unable to be logged in
  }

  const query = `
     SELECT * FROM students WHERE student_id = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching student grades:', err);
      return res.status(500).send('Database error');
    }

    res.render('students/dashboard', {
      student: results[0],
      title: 'Student Dashboard'
    });
  });
});

// Profile page for the logged-in student
router.get('/profile', (req, res) => {
  const studentId = req.session.user?.student_id;

  if (!studentId) {
    return res.redirect('/login');
  }

  const studentQuery = `
    SELECT * FROM students WHERE student_id = ?
  `;
  const gradesQuery = `
    SELECT g.first_grade, m.title AS module_title
    FROM grades g
    JOIN modules m ON g.module_id = m.module_id
    WHERE g.student_id = ?
  `;

  db.query(studentQuery, [studentId], (err, studentResults) => {
    if (err) {
      console.error('Error fetching student:', err);
      return res.status(500).send('Database error');
    }

    db.query(gradesQuery, [studentId], (err, gradeResults) => {
      if (err) {
        console.error('Error fetching grades:', err);
        return res.status(500).send('Database error');
      }


      res.render('students/profile', {
        student: studentResults[0],
        grades: gradeResults,
        title: 'My Profile'
      });
    });
  });
});

router.get('/progression', (req, res) => {
  const studentId = req.session.user?.student_id;

  if (!studentId) {
    return res.redirect('/login');
  }

  const query = `
    SELECT 
      s.student_id,
      s.first_name,
      s.last_name,
      SUM(m.credit_count) AS total_credits,
      ROUND(AVG(COALESCE(g.resit_grade, g.first_grade)), 2) AS average_grade,
      CASE 
        WHEN SUM(m.credit_count) >= 100 AND AVG(COALESCE(g.resit_grade, g.first_grade)) >= 40 THEN 'Eligible for Progression'
        ELSE 'Progression Not Met'
      END AS progression_status
    FROM students s
    JOIN grades g ON s.student_id = g.student_id
    JOIN modules m ON g.module_id = m.module_id
    WHERE s.student_id = ?
    GROUP BY s.student_id
  `;

  const gradesQuery = `
    SELECT g.first_grade, m.title AS module_title
    FROM grades g
    JOIN modules m ON g.module_id = m.module_id
    WHERE g.student_id = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching progression data:', err);
      return res.status(500).send('Database error');
    }

    db.query(gradesQuery, [studentId], (err, gradeResults) => {
      if (err) {
        console.error('Error fetching grades:', err);
        return res.status(500).send('Database error');
      }

      // Render the progression stats view with the data
      res.render('students/progression', {
        student: results[0], // Send the student's progression data to the view
        grades: gradeResults,
        title: 'My Progression'
      });
    });
  });
});

// Route to render the edit profile page
router.get('/edit-profile', (req, res) => {
  const studentId = req.session.user?.student_id;

  if (!studentId) {
    return res.redirect('/login'); // Redirect if the student is not logged in
  }

  const query = 'SELECT * FROM students WHERE student_id = ?';

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching student data:', err);
      return res.status(500).send('Database error');
    }

    res.render('students/edit-profile', {
      student: results[0], // Send student data to the view
      title: 'Edit Profile',
    });
  });
});

// Route to handle the form submission and update the student data
router.post('/edit-profile', (req, res) => {
  const { student_id, first_name, last_name, email, profile_image } = req.body;
  const query = `
    UPDATE students
    SET first_name = ?, last_name = ?, email = ?, profile_image = ?
    WHERE student_id = ?
  `;

  db.query(query, [first_name, last_name, email, profile_image, student_id], (err, result) => {
    if (err) {
      console.error('Error updating student data:', err);
      return res.status(500).send('Failed to update profile');
    }

    res.redirect('/students/profile'); // Redirect to profile page after update
  });
});

// Route to view all messages for student
router.get('/messages', (req, res) => {
  const studentId = req.session.user?.student_id;

  if (!studentId) {
    return res.redirect('/login');
  }

  // gets messages sent to or received by the student
  db.query('SELECT * FROM messages WHERE recipient_id = ?', [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).send('Database error');
    }

    res.render('students/messageList', {
      messages: results,
      title: 'My Messages'
    });
  });
});

// Route to send a new message as student
router.get('/messages/send', (req, res) => {
  const studentId = req.session.user?.student_id;

  if (!studentId) {
    return res.redirect('/login');
  }

  db.query('SELECT * FROM students WHERE student_id != ?', [studentId], (err, students) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).send('Database error');
    }

    res.render('students/sendMessage', { students, title: 'Send Message' });
  });
});

// Handles sending a message as student
router.post('/messages/send', (req, res) => {
  const { recipient_id, message_text } = req.body;
  const studentId = req.session.user?.student_id;

  if (!studentId) {
    return res.redirect('/login');
  }

  const query = `
    INSERT INTO messages (sender_id, recipient_id, message_text)
    VALUES (?, ?, ?)
  `;

  db.query(query, [studentId, recipient_id, message_text], (err, result) => {
    if (err) {
      console.error('Error sending message:', err);
      return res.status(500).send('Failed to send message');
    }

    res.redirect('/students/messages');
  });
});




module.exports = router;
