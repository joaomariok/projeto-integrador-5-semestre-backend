// Imports
const express = require("express");
const cors = require("cors");
const connection = require("./db.js")
const { router } = require("./routes");

const port = process.env.port || 5000

// Database imports
// const { tryDatabaseConnection } = require('./database/connection');
const db =  mysql.createConnection({
  connectionaLimit: 50,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  port: 3306
});

// Express definitions
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(router);

// Connection to database
(tryDatabaseConnection)();

// Listen on port
app.listen(port,  (err) => {
    console.log(`Listening on port ${port}`);
});