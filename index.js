// Imports
// const express = require("express");
// const cors = require("cors");
// const mysql = require('mysql')
const { router } = require("./routes");
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

app.use(cors());


const PORT = process.env.PORT  ||  5000

// // Database imports
// const { tryDatabaseConnection } = require('./database/connection');
// const db =  mysql.createConnection({
//   connectionaLimit: 50,
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DATABASE,
//   port: 3306
// });

// // Express definitions
// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(router);

// // Connection to database
// (tryDatabaseConnection)();

// // Listen on port
// app.listen(port,  (err) => {
//     console.log(`Listening on port ${port}`);
// });
var pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB
});

pool.getConnection((err, connection) => {

});

app.listen(PORT, () => {
    console.log(`My project SQL server listening on PORT ${PORT}`);
});