var http = require('http'),
    express = require('express'),
    mysql = require('mysql'),
    parser = require('body-parser'),
    cors = require('cors');

var Bidding = require("./models/mysql/sales");

var app = express();
app.use(cors());
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 5000);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});

app.get('/api/sales/get-all-sales', function (req, res) {
    var response;
    res.setHeader('Content-Type', 'application/json');
    Bidding.getSalesData(req.query, function (err, result) {
        if (!err) {
            res.status(200).send(result);
        } else {
            response = { status: 'f', message: 'Error in read' };
            res.status(400).send(response);
        }
    });
});

app.get('/api/sales/get-sales-by-group', function (req, res) {
    var response;
    res.setHeader('Content-Type', 'application/json');
    Bidding.getSalesByGroup(req.query, function (err, result) {
        if (!err) {
            res.status(200).send(result);
        } else {
            response = { status: 'f', message: 'Error in read' };
            res.status(400).send(response);
        }
    });
});

