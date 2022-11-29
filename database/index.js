const keys = require("./keys");
const Sequelize = require('sequelize');

const database = new Sequelize(
    keys.mysqlName,
    keys.mysqlUser,
    keys.mysqlPass,
    {
        dialect: 'postgres',
        host: keys.mysqlHost
    }
);

module.exports = database;