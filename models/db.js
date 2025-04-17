const mysql = require("mysql2/promise"); // nota: usamos 'promise'

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // cambia por la tuya
  database: "paracaidismo_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
