require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  database: "FYP local connections",
});

// Verify database connection
pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Connected to database");
  connection.release();
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // The rest of the registration code goes here
});

// Listen on a port
app.listen(3000, () => console.log('Server running on port 3000'));
