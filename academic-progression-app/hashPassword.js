const bcrypt = require('bcrypt');

// Password for Ryan
const passwordRyan = 'RyanPassword123'; // Set the password for Ryan

// Hash the password for Ryan
bcrypt.hash(passwordRyan, 10, (err, hashRyan) => {
  if (err) {
    console.error('Error hashing password for Ryan:', err);
  } else {
    console.log('Hashed password for Ryan:', hashRyan);
    // This will be used to insert into the DB
  }
});
