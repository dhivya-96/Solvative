const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const db = new sqlite3.Database('mydatabase.db');

const app = express();

const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running and App is listening on port :", PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);


app.get('/', (req, res) => {
    // Query the database for all records in the 'users' table
    db.all('SELECT * FROM users', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });

  app.get('/rewardsHistory', (req, res) => {
    // Query the database for all records in the 'rewardsHistory' table
    db.all('SELECT * FROM rewardsHistory', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });


app.post('/newuser', (req, res) => {
    const { name, PF, reward } = req.body;

    if (typeof reward !== 'number' || typeof name !== 'string' || typeof PF !== 'number') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    // Prepare the SQL query to insert a new user
  const sql = `INSERT INTO users (name, PF, reward) VALUES (?, ?, ?)`;

  // Execute the SQL query
  db.run(sql, [name, PF, reward], function(err) {
    if (err) {
      // If there's an error, respond with a 500 status code and the error message
      return res.status(500).json({ error: err.message });
    }
    // Respond with success and the ID of the new row
    res.json({ message: 'User added successfully', id: this.lastID });
  });
});

app.post('/edituser', (req, res) => {
    const { id, name } = req.body;
  
    // Validate input
    if (typeof id !== 'number' || typeof name !== 'string') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    // Prepare the SQL query to update the user
    const sql = 'UPDATE users SET name = ? WHERE id = ?';
  
    // Execute the SQL query
    db.run(sql, [name, id], function(err) {
      if (err) {
        // If there's an error, respond with a 500 status code and the error message
        return res.status(500).json({ error: err.message });
      }
  
      // Check if any rows were updated
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Respond with success message
      res.json({ message: 'User updated successfully', changes: this.changes });
    });
  });

app.get('/getrewards/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
  
   // Validate that id is a number
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
  
    // Prepare the SQL query to fetch data from the users table
    const sql = 'SELECT id, reward FROM users WHERE id = ?';
  
    // Execute the SQL query
    db.get(sql, [userId], (err, row) => {
      if (err) {
        // If there's an error, respond with a 500 status code and the error message
        return res.status(500).json({ error: err.message });
      }
      
      // Check if the user exists
      if (!row) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Respond with the user data
      res.json(row);
    });
  });

app.post('/deleteUpdateReward', (req, res) => {
    const { id, senderid } = req.body;
  
    // Validate input
    if (typeof id !== 'number' || typeof senderid !== 'number') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    // Prepare the SQL query to delete the record
    const sql = 'DELETE FROM rewardsHistory WHERE id = ? AND senderid = ?';
  
    // Execute the SQL query
    db.run(sql, [id, senderid], function(err) {
      if (err) {
        // If there's an error, respond with a 500 status code and the error message
        return res.status(500).json({ error: err.message });
      }
  
      // Check if any rows were deleted
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Record not found' });
      }
  
      // Respond with success message
      res.json({ message: 'Record deleted successfully', changes: this.changes });
    });
  });

  app.post('/addReward', (req, res) => {
    const { senderid, receiverid, reward } = req.body;
  
    // Validate input
    if (
      typeof senderid !== 'number' ||
      typeof receiverid !== 'number' ||
      typeof reward !== 'number' 
    ) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    // Start a transaction to ensure atomic operations
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
  
      // Insert new record into rewardsHistory
      db.run(
        'INSERT INTO rewardsHistory (senderid, receiverid, reward) VALUES (?, ?, ?)',
        [senderid, receiverid, reward],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ errordini: err.message });
          }
  
          // Update the users table
          // Subtract reward from the sender's PF field
          db.run(
            'UPDATE users SET PF = PF - ? WHERE id = ?',
            [reward, senderid],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ errorupdate: err.message });
              }
  
              // Add reward to the receiver's Reward field
              db.run(
                'UPDATE users SET reward = reward + ? WHERE id = ?',
                [reward, receiverid],
                function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ errorreward: err.message });
                  }
  
                  // Commit the transaction
                  db.run('COMMIT');
                  res.json({ message: 'Reward added and users updated successfully' });
                }
              );
            }
          );
        }
      );
    });
  });

  app.post('/deleteReward', (req, res) => {
    const { id, senderid, receiverid } = req.body;
    
    if (typeof id !== 'number' || typeof senderid !== 'number' || typeof receiverid !== 'number') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    // Start a transaction to ensure atomic operations
    db.serialize(() => {
      // First, fetch the reward value from rewardsHistory
      db.get('SELECT reward FROM rewardsHistory WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (!row) {
          return res.status(404).json({ message: 'Reward record not found' });
        }
        
        const rewardValue = row.reward;
  
        // Update the PF and Reward fields in the users table
        db.run('BEGIN TRANSACTION');
        
        db.run('UPDATE users SET PF = PF + ? WHERE id = ?', [rewardValue, senderid], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          
          db.run('UPDATE users SET reward = reward - ? WHERE id = ?', [rewardValue, receiverid], function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }
  
            // Delete the record from rewardsHistory
            db.run('DELETE FROM rewardsHistory WHERE id = ?', [id], function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }
  
              // Commit the transaction
              db.run('COMMIT');
              
              res.json({ message: 'Record processed and deleted successfully' });
            });
          });
        });
      });
    });
  });

//Setup database

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
      reward INTEGER,
      senderid INTEGER,
      receiverid INTEGER,
      FOREIGN KEY (senderid) REFERENCES users(id),
      FOREIGN KEY (receiverid) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating rewardsHistory table:', err.message);
    } else {
      console.log('Table "rewardsHistory" created successfully.');
    }
  });
  
});

// db.close();