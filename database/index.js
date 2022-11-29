const keys = require("./keys");
const Sequelize = require('sequelize');

const database = new Sequelize(
    keys.mysqlName,
    keys.mysqlUser,
    keys.mysqlPass,
    {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        host: keys.mysqlHost,
    }
);

module.exports = database;