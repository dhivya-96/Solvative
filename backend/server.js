const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const db = new sqlite3.Database("mydatabase.db");

const app = express();

const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());

// init server
app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running and App is listening on port :",
      PORT
    );
  else console.log("Error occurred, server can't start", error);
});

// Route to get all users
app.get("/", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Route to get a user by ID
app.get("/getuser/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT * FROM users WHERE id = ?";

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
});

// Route to get all rewards history
app.get("/rewardsHistoryAll", (req, res) => {
  db.all("SELECT * FROM rewardsHistory", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Route to get P5 history by sender id
app.get("/P5History", (req, res) => {
  const { senderid } = req.query;

  // Validate sender Id
  if (!senderid) {
    return res.status(400).json({ error: "senderId is required" });
  }

  // Query the database for records with the specified senderId
  const query = `
    SELECT 
      rewardsHistory.id,
      rewardsHistory.timestamp,
      rewardsHistory.reward,
      sender.name AS senderName,
      receiver.name AS receiverName,
      sender.id AS senderid,
      receiver.id AS receiverid
    FROM rewardsHistory
    LEFT JOIN users AS sender ON rewardsHistory.senderid = sender.id
    LEFT JOIN users AS receiver ON rewardsHistory.receiverid = receiver.id
    WHERE rewardsHistory.senderid = ?
  `;

  db.all(query, [senderid], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Route to get rewards history by receiver id
app.get("/rewardsHistory", (req, res) => {
  const { receiverid } = req.query;

  // Validate receiver id
  if (!receiverid) {
    return res.status(400).json({ error: "receiverid is required" });
  }

  // Query the database for records with the specified receiver id
  const query = `
    SELECT 
      rewardsHistory.id,
      rewardsHistory.timestamp,
      rewardsHistory.reward,
      sender.name AS senderName,
      receiver.name AS receiverName,
      sender.id AS senderid,
      receiver.id AS receiverid
    FROM rewardsHistory
    LEFT JOIN users AS sender ON rewardsHistory.senderid = sender.id
    LEFT JOIN users AS receiver ON rewardsHistory.receiverid = receiver.id
    WHERE rewardsHistory.receiverid = ?
  `;

  db.all(query, [receiverid], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Route to create new user
app.post("/newuser", (req, res) => {
  const { name, PF, reward } = req.body;

  // Validate input
  if (
    typeof reward !== "number" ||
    typeof name !== "string" ||
    typeof PF !== "number"
  ) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Prepare the SQL query to insert a new user
  const sql = `INSERT INTO users (name, PF, reward) VALUES (?, ?, ?)`;

  // Execute the SQL query
  db.run(sql, [name, PF, reward], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "User added successfully", id: this.lastID });
  });
});

// Route to edit user
app.post("/edituser", (req, res) => {
  const { id, name } = req.body;

  // Validate input
  if (typeof id !== "number" || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Prepare the SQL query to update the user
  const sql = "UPDATE users SET name = ? WHERE id = ?";

  // Execute the SQL query
  db.run(sql, [name, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if any rows were updated
    if (this.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", changes: this.changes });
  });
});

// Route get reward data for a specific user by user id
app.get("/getrewards/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);

  // Validate input
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // Prepare the SQL query to fetch data from the users table
  const sql = "SELECT id, reward FROM users WHERE id = ?";

  // Execute the SQL query
  db.get(sql, [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if the user exists
    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(row);
  });
});

// Route to delete reward
app.post("/deleteReward", (req, res) => {
  const { id, senderid } = req.body;

  // Validate input
  if (typeof id !== "number" || typeof senderid !== "number") {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Prepare the SQL query to delete the record
  const sql = "DELETE FROM rewardsHistory WHERE id = ? AND senderid = ?";

  // Execute the SQL query
  db.run(sql, [id, senderid], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if any rows were deleted
    if (this.changes === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Record deleted successfully", changes: this.changes });
  });
});

// Route to add reward
app.post("/addReward", (req, res) => {
  const { senderid, receiverid, reward } = req.body;

  // Validate input
  if (
    typeof senderid !== "number" ||
    typeof receiverid !== "number" ||
    typeof reward !== "number"
  ) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Start a transaction to ensure atomic operations
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Insert new record into rewardsHistory
    db.run(
      "INSERT INTO rewardsHistory (senderid, receiverid, reward) VALUES (?, ?, ?)",
      [senderid, receiverid, reward],
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ errordini: err.message });
        }

        // Deduct reward from the sender's PF field
        db.run(
          "UPDATE users SET PF = PF - ? WHERE id = ?",
          [reward, senderid],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ errorupdate: err.message });
            }

            // Add reward to the receiver's Reward field
            db.run(
              "UPDATE users SET reward = reward + ? WHERE id = ?",
              [reward, receiverid],
              function (err) {
                if (err) {
                  db.run("ROLLBACK");
                  return res.status(500).json({ errorreward: err.message });
                }

                // Commit the transaction
                db.run("COMMIT");
                res.json({
                  message: "Reward added successfully and updated PF and reward values for the corresponding users",
                });
              }
            );
          }
        );
      }
    );
  });
});

// Route to delete reward and update corresponding users with PF and rewards values
app.post("/deleteRewardAndUpdateUsers", (req, res) => {
  const { id, senderid, receiverid } = req.body;

  // Validate input
  if (
    typeof id !== "number" ||
    typeof senderid !== "number" ||
    typeof receiverid !== "number"
  ) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Start a transaction to ensure atomic operations
  db.serialize(() => {
    // Fetch the reward value from rewardsHistory
    db.get(
      "SELECT reward FROM rewardsHistory WHERE id = ?",
      [id],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!row) {
          return res.status(404).json({ message: "Reward record not found" });
        }

        const rewardValue = row.reward;

        db.run("BEGIN TRANSACTION");

        // Update the PF and Reward fields in the users table
        db.run(
          "UPDATE users SET PF = PF + ? WHERE id = ?",
          [rewardValue, senderid],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err.message });
            }

            db.run(
              "UPDATE users SET reward = reward - ? WHERE id = ?",
              [rewardValue, receiverid],
              function (err) {
                if (err) {
                  db.run("ROLLBACK");
                  return res.status(500).json({ error: err.message });
                }

                // Delete the record from rewardsHistory
                db.run(
                  "DELETE FROM rewardsHistory WHERE id = ?",
                  [id],
                  function (err) {
                    if (err) {
                      db.run("ROLLBACK");
                      return res.status(500).json({ error: err.message });
                    }

                    // Commit the transaction
                    db.run("COMMIT");

                    res.json({
                      message: "Reward deleted successfully and updated PF and reward values for the corresponding users",
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

//Setup database
db.serialize(() => {
  // Create users table
  db.run(
    `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        PF INTEGER,
        reward INTEGER
      )
    `,
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log('Table "users" created successfully.');
      }
    }
  );

  // Create rewardsHistory table
  db.run(
    `
      CREATE TABLE IF NOT EXISTS rewardsHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        reward INTEGER,
        senderid INTEGER,
        receiverid INTEGER,
        FOREIGN KEY (senderid) REFERENCES users(id),
        FOREIGN KEY (receiverid) REFERENCES users(id)
      )
    `,
    (err) => {
      if (err) {
        console.error("Error creating rewardsHistory table:", err.message);
      } else {
        console.log('Table "rewardsHistory" created successfully.');
      }
    }
  );
});

// db.close();
