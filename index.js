// Imports
const express = require("express");
const cors = require("cors");

const { router } = require("./routes");

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
    console.log(`Listening on port ${PORT}`);
});