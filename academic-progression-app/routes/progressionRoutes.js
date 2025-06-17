// Required dependencies
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Gets the progression summary
router.get('/progression', (req, res) => {

  // SQL query that calculates total credits and average grades

  // By using coalesce below we tell it to skip the null value (so if resit is null it will use the first grade, or uses the resit if there
  // was one in the student's records)
  // - Total credits only come from the valid passed attempts
  // - Students need 100+ credits AND average 40+ grade to pass progression check
  const query = `
   SELECT 
     s.student_id,
     s.first_name,
     s.last_name,
     SUM(m.credit_count) AS total_credits,
     ROUND(AVG(COALESCE(g.resit_grade, g.first_grade)), 1) AS average_grade,
     CASE 
       WHEN 
         SUM(m.credit_count) >= 100 AND 
         AVG(COALESCE(g.resit_grade, g.first_grade)) >= 40
       THEN 'Eligible for Progression'
       ELSE 'Progression Not Met'
     END AS progression_status
   FROM students s
   JOIN grades g ON s.student_id = g.student_id
   JOIN modules m ON g.module_id = m.module_id
   WHERE g.grade_result NOT IN ('excused', 'absent')
   GROUP BY s.student_id
   ORDER BY s.student_id
 `;

  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving progression data:', err);
      return res.status(500).send('Database error');
    }

    // Render the progression view and pass the results
    res.render('admin/progressionSummary', { summary: results });
  });
});

module.exports = router;