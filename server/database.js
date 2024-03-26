const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  database: "FYP local connections",
});

function connect(callback) {
  pool.getConnection((err, connection) => {
    if (err) return callback(err);
    callback(null, connection);
  });
}

module.exports = { connect };
