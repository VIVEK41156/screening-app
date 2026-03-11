const db = require('./db');

const createTables = async () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'HR'
    );
  `;

  const jobsTable = `
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      skills TEXT NOT NULL,
      experience INTEGER NOT NULL,
      location VARCHAR(255),
      salary_range VARCHAR(100)
    );
  `;

  const candidatesTable = `
    CREATE TABLE IF NOT EXISTS candidates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      skills TEXT,
      experience INTEGER
    );
  `;

  const scoresTable = `
    CREATE TABLE IF NOT EXISTS scores (
      candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
      job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      score FLOAT NOT NULL,
      PRIMARY KEY (candidate_id, job_id)
    );
  `;

  try {
    console.log("Creating Database Tables...");
    await db.query(usersTable);
    console.log("Users table OK");
    await db.query(jobsTable);
    console.log("Jobs table OK");
    await db.query(candidatesTable);
    console.log("Candidates table OK");
    await db.query(scoresTable);
    console.log("Scores table OK");
    console.log("All tables created successfully!");

    // Insert mock HR user for testing
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash('password123', 10);
    const checkUser = await db.query('SELECT * FROM users WHERE email = $1', ['admin@hr-tech.com']);
    if (checkUser.rows.length === 0) {
      await db.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3)', ['admin@hr-tech.com', hashed, 'Admin']);
      console.log("Inserted default admin user (admin@hr-tech.com / password123)");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error creating tables", err);
    process.exit(-1);
  }
};

createTables();
