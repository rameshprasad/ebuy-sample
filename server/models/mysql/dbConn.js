var mysql = require('mysql');
module.exports.getDbConn = function () {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'dbebuy',
        multipleStatements: true
    });
    try {
        connection.connect();
        return connection;
    } catch (e) {
        console.log('Database Connetion failed:' + e);
        return null;
    }
}

