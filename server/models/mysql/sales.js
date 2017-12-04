var dbConn = require("./dbConn");

module.exports.getSalesData = function (param, callback) {
    var result = {};
    var conn = dbConn.getDbConn();
    var sqlQuery = "SELECT id, txnt_id, username, product_zone, product, brand, model, date_time, quantity, amount " +
        "FROM sales ORDER BY id;";
    conn.query(sqlQuery, function (err, data) {
        if (!err) {
            result.status = 's';
            result.data = data;
        }
        else {
            result.status = 'f';
            result.msg = 'Error in records retrieval.';
        }
        callback(null, result);
        conn.end();
    });
}

module.exports.getSalesByGroup = function (param, callback) {
    var result = {};
    var conn = dbConn.getDbConn();
    var sqlQuery = "";
    if (param.groupBy === 'user') {
        sqlQuery = "SELECT username, MIN(amount) AS min_amount, MAX(amount) AS max_amount, AVG(amount) AS avg_amount, " +
            " SUM(amount) AS total_amount, COUNT(product) AS total_products, COUNT(txnt_id) AS total_trans" +
            " FROM sales GROUP BY username ORDER BY username;";
    }
    else if (param.groupBy === 'product') {
        qlQuery = "SELECT product, COUNT(username) AS total_users, SUM(quantity) AS total_sold, SUM(amount * quantity) AS total_revenue" +
            " FROM sales GROUP BY product ORDER BY product;";
    }
    else if (param.groupBy === 'product-zone') {
        qlQuery = "SELECT product_zone, COUNT(username) AS total_users, SUM(quantity) AS total_sold, SUM(amount * quantity) AS total_revenue" +
            " FROM sales GROUP BY product_zone ORDER BY product_zone;";
    }
    console.log(sqlQuery);

    conn.query(sqlQuery, function (err, data) {
        if (!err) {
            result.status = 's';
            result.data = data;
        }
        else {
            result.status = 'f';
            result.msg = 'Error in records retrieval.';
        }
        callback(null, result);
        conn.end();
    });
}
