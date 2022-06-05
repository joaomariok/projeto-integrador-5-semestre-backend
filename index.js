// Imports
const express = require("express");
const cors = require("cors");

const { router } = require("./routes");
const port = process.env.port || 5000

// Database imports
const { tryDatabaseConnection } = require('./database/connection');

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