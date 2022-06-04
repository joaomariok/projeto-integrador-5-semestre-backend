const env = require("./env");

module.exports = {
    mysqlHost: env.MYSQL_HOST,
    mysqlUser: env.MYSQL_USER,
    mysqlPass: env.MYSQL_PASS,
    mysqlName: env.MYSQL_NAME,
    mysqlPort: env.MYSQL_PORT,
    isDebug: env.DEBUG === 'true',
};