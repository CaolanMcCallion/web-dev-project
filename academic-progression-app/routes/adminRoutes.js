const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const csv = require('csv-parser');
const path = require('path');


// Set up multer to handle CSV file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensures unique file names
  }
});
const upload = multer({ storage: storage });


//        STUDENTS

// gets all student records
router.get('/students', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    // Renders the student list HTML
    res.render('admin/studentList', {
      students: results,
      title: 'Student List'
    });
  });
});

// CSV upload page (admin)
router.get('/students/upload', (req, res) => {
  res.render('admin/uploadCsv', { title: 'Upload CSV' });
});

// Handle CSV file upload
router.post('/students/upload', upload.single('csvfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const results = [];
  const filePath = path.join(__dirname, '../uploads', req.file.filename);

  // Parse CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Process the CSV data and insert into the database
      results.forEach((student) => {
        const query = `
          INSERT INTO students (student_id, first_name, last_name, entry_level, status_study)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(query, [
          student.student_id,
          student.first_name,
          student.last_name,
          student.entry_level,
          student.status_study,
        ], (err) => {
          if (err) {
            console.error('Error inserting student:', err);
          }
        });
      });

      // After processing, redirect to student list page
      res.redirect('/admin/students');
    });
});

// Route to handle deleting a student by student_id
router.post('/students/delete/:student_id', (req, res) => {
  const { student_id } = req.params;

  db.query('DELETE FROM students WHERE student_id = ?', [student_id], (err, result) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).send('Failed to delete student.');
    }

    // Tells the browser to redirect to the students list
    res.redirect('/admin/studentsList');
  });
});

// Show the form to add a new student
router.get('/students/add', (req, res) => {
  res.render('admin/addStudent', { title: 'Add Student' });
});


// Adds a new student to the database
router.post('/students/add', (req, res) => {
  const { student_id, first_name, last_name, entry_level, status_study } = req.body;

  const query = `
    INSERT INTO students (student_id, first_name, last_name, entry_level, status_study)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [student_id, first_name, last_name, entry_level, status_study], (err, result) => {
    if (err) {
      console.error('Error adding student:', err);
      return res.status(500).send('Failed to add student.');
    }

    res.redirect('/admin/studentList');
  });
});

// Get the edit form for a specific student
router.get('/students/edit/:student_id', (req, res) => {
  const studentId = req.params.student_id;

  db.query('SELECT * FROM students WHERE student_id = ?', [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching student:', err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(404).send('Student not found');
    }

    res.render('admin/editStudent', { 
      student: results[0],
      title: 'Edit Student' 
  });
});
});

// Update student info after editing
router.post('/students/edit/:student_id', (req, res) => {
  const { student_id } = req.params;
  const { first_name, last_name, entry_level, status_study } = req.body;

  const query = `
    UPDATE students
    SET first_name = ?, last_name = ?, entry_level = ?, status_study = ?
    WHERE student_id = ?
  `;

  db.query(query, [first_name, last_name, entry_level, status_study, student_id], (err, result) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.status(500).send('Failed to update student.');
    }

    res.redirect('/admin/students');
  });
});

//         MODULES

// Get all modules
router.get('/modules', (req, res) => {
  db.query('SELECT * FROM modules', (err, results) => {
    if (err) {
      console.error('Error fetching modules:', err);
      return res.status(500).send('Database error');
    }
    res.render('admin/moduleList', {
      modules: results,
      title: 'Module List'
    });

  });
});

// Show the form to add a new module
router.get('/modules/add', (req, res) => {
  res.render('admin/addModule', { title: 'Add New Module' });
});


// Adds a new module to the database
router.post('/modules/add', (req, res) => {
  const { subj_code, catalog_number, title, credit_count, semester } = req.body;

  const query = `
    INSERT INTO modules (subj_code, catalog_number, title, credit_count, semester)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [subj_code, catalog_number, title, credit_count, semester], (err, result) => {
    if (err) {
      console.error('Error inserting module:', err);
      return res.status(500).send('Failed to add module');
    }

    res.redirect('/admin/modules');
  });
});

//          GRADES

// Get all grades
router.get('/grades', (req, res) => {
  const query = `
    SELECT g.id, g.student_id, s.first_name, s.last_name, m.title AS module_title, g.first_grade, g.resit_grade
    FROM grades g
    JOIN students s ON g.student_id = s.student_id
    JOIN modules m ON g.module_id = m.module_id
    ORDER BY g.student_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching grades:', err);
      return res.status(500).send('Failed to retrieve grades.');
    }

    res.render('admin/gradeList', {
      grades: results,
      title: 'Grade List'
    });
  });
});

// Show the form to add a new grade
router.get('/grades/add', (req, res) => {
  const getStudents = 'SELECT student_id, first_name, last_name FROM students';
  const getModules = 'SELECT module_id, title, subj_code, catalog_number FROM modules';

  db.query(getStudents, (err, students) => {
    if (err) return res.status(500).send('Error loading students');

    db.query(getModules, (err, modules) => {
      if (err) return res.status(500).send('Error loading modules');

      res.render('admin/addGrade', { students, modules });
    });
  });
});

// Route to handle adding a new grade
router.post('/grades/add', (req, res) => {
  const { student_id, module_id, grade, resit_grade, grade_result, resit_result } = req.body;

  const query = `
    INSERT INTO grades (student_id, module_id, first_grade, resit_grade, grade_result, resit_result)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [student_id, module_id, grade, resit_grade || null, grade_result || null, resit_result || null], (err, result) => {
    if (err) {
      console.error('Error adding grade:', err);
      return res.status(500).send('Failed to add grade.');
    }

    res.redirect('/admin/grades');
  });
});

// Show the form to edit a grade
router.get('/grades/edit/:id', (req, res) => {
  const gradeId = req.params.id;
  const gradeQuery = 'SELECT * FROM grades WHERE id = ?';
  const studentQuery = 'SELECT student_id, first_name, last_name FROM students';
  const moduleQuery = 'SELECT module_id, title, subj_code, catalog_number FROM modules';

  db.query(gradeQuery, [gradeId], (err, gradeResults) => {
    if (err || gradeResults.length === 0) {
      console.error('Error fetching grade:', err);
      return res.status(500).send('Grade not found');
    }

    db.query(studentQuery, (err, students) => {
      if (err) return res.status(500).send('Error loading students');

      db.query(moduleQuery, (err, modules) => {
        if (err) return res.status(500).send('Error loading modules');

        res.render('admin/editGrade', {
          title: 'Edit Grade',
          grade: gradeResults[0],
          students,
          modules
        });
      });
    });
  });
});

// Handle grade update
router.post('/grades/edit/:id', (req, res) => {
  const { id } = req.params;
  const { student_id, module_id, grade, resit_grade, grade_result, resit_result } = req.body;

  const updateQuery = `
    UPDATE grades
    SET student_id = ?, module_id = ?, first_grade = ?, resit_grade = ?, grade_result = ?, resit_result = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [student_id, module_id, grade, resit_grade || null, grade_result || null, resit_result || null, id], (err, result) => {
    if (err) {
      console.error('Error updating grade:', err);
      return res.status(500).send('Failed to update grade.');
    }

    res.redirect('/admin/grades');
  });
});

// Route to handle deleting a grade by grade_id
router.post('/grades/delete/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM grades WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting grade:', err);
      return res.status(500).send('Failed to delete grade.');
    }

    res.redirect('/admin/grades');
  });
});


//       PROGRESSION

// Get the progression summary
router.get('/progression', (req, res) => {

  // SQL query to calculate total credits and average grades for each student
  // Coalesce again used (as it is in the progression routes) to distinguish whether a resit has been taken or not
  // When the credits are 100 or over & the average grade is 40 or over they are eligible, if not progression not met
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
    GROUP BY s.student_id
    ORDER BY s.student_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving progression data:', err);
      return res.status(500).send('Database error');
    }

    res.render('admin/progressionSummary', {
      summary: results,
      title: 'Progression Summary'
    });

  });
});

// Admin dashboard route
router.get('/dashboard', (req, res) => {
  const username = req.session.user?.username || 'Admin';

  res.render('admin/dashboard', {
    username,
    title: 'Dashboard'
  });
});

// Route to view all messages for admin
router.get('/messages', (req, res) => {
  db.query('SELECT * FROM messages', (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).send('Database error');
    }
    res.render('admin/messageList', { messages: results, title: 'All Messages' });
  });
});

// Route to send a new message as admin
router.get('/messages/send', (req, res) => {
  db.query('SELECT * FROM students', (err, students) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).send('Database error');
    }
    res.render('admin/sendMessage', { students, title: 'Send Message' });
  });
});

// Handle sending a message as admin
router.post('/messages/send', (req, res) => {
  const { sender_id, recipient_id, message_text } = req.body;

  const query = `
    INSERT INTO messages (sender_id, recipient_id, message_text)
    VALUES (?, ?, ?)
  `;

  db.query(query, [sender_id, recipient_id, message_text], (err, result) => {
    if (err) {
      console.error('Error sending message:', err);
      return res.status(500).send('Failed to send message');
    }

    res.redirect('/admin/messages');
  });
});



module.exports = router;
