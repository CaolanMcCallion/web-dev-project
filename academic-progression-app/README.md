# Academic Progression Web App

## Overview

The **Academic Progression Monitoring Web App** allows students and administrators to track academic progression, manage student records, grades, modules, and communicate through messaging features. The application supports both student and admin roles, with a different set of permissions for each.

This app is built using **Node.js** and **MySQL** for the backend, with **EJS** templates for rendering dynamic content in the frontend.

## Features

### Student Features:
- View and edit personal profile
- Track academic progression with grades and credits
- Send and receive messages

### Admin Features:
- Manage student records (add, edit, delete)
- Manage modules (add, edit, delete)
- View student grades and academic progression
- Send messages to students
- Upload students via CSV

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js
  - MySQL
  - Multer (for CSV upload)
  - EJS (for dynamic page rendering)

- **Frontend**:
  - HTML
  - CSS (Bootstrap for styling)
  - JavaScript

## Setup Instructions

### 1. Clone the repository

Clone this repository to your local machine:

```bash
git clone https://gitlab.eeecs.qub.ac.uk/40449210/academic-progression-app.git



## 2. Install dependencies

Navigate to the project directory and install the dependencies:

cd academic-progression-app
npm install



## 3. Set up the Database

Create a MySQL database then import the provided 40449210.sql file to set up the tables in the database.

mysql -u root -p < 40449210.sql



## 4. Set up the .env file (optional)
If you would like to use environment variables, create a .environment file in the root directory with the following content:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=academic_progression_db

This will allow you to use the correct database credentials.



## 5. Start the app

Run the following to start the web app:
npm start (or npx nodemon index.js if using nodemon).

The app will be accessible on http://localhost:3000.




## Login Credentials

Admin Login
- Username: tester
- Password: ThisIsATest123

Student Login
- Username: RyanAdams123
- Password: RyanPassword123

If you would like to change these credentials you can create new users via the admin dashboard or do this in the database directly.



## Folder structure

After cloning the repository:

40449210/
├── source/
│   ├── webapp/
├── 40449210.sql
├── gitlog.txt
└── 40449210.pdf



## How to run this web app
1. Clone the repository to your local machine
2. Install dependencies using npm install.
3. Set up the MySQL database and import 40449210.sql.
4. Run the application using npm start.
5. Access the app at http://localhost:3000.



### Some notes:
1. **Login Credentials**: The **admin** and **student** credentials are pre-set, but the examiner can modify these through the admin dashboard or in the database directly if necessary.
