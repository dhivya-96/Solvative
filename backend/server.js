const express = require('express');

const app = express();
const PORT = 3000;

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running and App is listening on port :", PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydatabase.db');

db.serialize(() => {
  // Creating the tables (users , rewards-history)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      PF INTEGER,
      reward INTEGER
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table "users" created successfully.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS rewardsHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      PF INTEGER,
      sender INTEGER,
      receiver INTEGER,
      FOREIGN KEY (sender) REFERENCES users(id),
      FOREIGN KEY (receiver) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating rewardsHistory table:', err.message);
    } else {
      console.log('Table "rewardsHistory" created successfully.');
    }
  });
  
});

db.close();