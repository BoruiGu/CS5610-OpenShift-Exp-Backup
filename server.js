var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 2525;

app.get('/hello', function (req, res) {
    res.send('hello world');
});

app.use(express.static(__dirname + '/src'));

app.listen(port, ip);

// 03-list-management-select

//app.get('/node.js/Exp03', function (req, res) {
//    res.sendfile('./src/03-list-management-select.html');
//});

var vns = [
        { title: "0008 The Story", date: "2015-02-16", rating: 6.28 },
        { title: "Baldr Sky Dive1 “Lost Memory”", date: "	2009-03-27", rating: 8.58 },
        { title: "Tsuki ni Yorisou Otome no Sahou", date: "2012-10-26", rating: 7.69 },
        { title: "V.G. Neo", date: "2003-12-19", rating: 6.20 },
];

var vns_copy = [
        { title: "0008 The Story", date: "2015-02-16", rating: 6.28 },
        { title: "Baldr Sky Dive1 “Lost Memory”", date: "	2009-03-27", rating: 8.58 },
        { title: "Tsuki ni Yorisou Otome no Sahou", date: "2012-10-26", rating: 7.69 },
        { title: "V.G. Neo", date: "2003-12-19", rating: 6.20 },
];

app.get('/api/vns', function (req, res) {
    res.json(vns);
});

app.delete('/api/vns/index/:index', function (req, res) {
    vns.splice(req.params.index, 1);
    res.json(vns);
});

app.delete('/api/vns/name/:name', function (req, res) {
    var index = -1;
    for (var i in vns) {
        if (vns[i].title == req.params.name) {
            index = i;
            break;
        }
    }
    if (index == -1) {
        console.log("ERR: DELETE api/vns/name/" + req.params.name + " can't find index");
    } else {
        vns.splice(index, 1);
    }
    res.json(vns);
});

app.post('/api/vns', function (req, res) {
    vns.push(req.body);
    res.json(vns);
});

app.post('/api/vns/updateSort/:oldIndex/:newIndex', function (req, res) {
    vns.splice(req.params.newIndex, 0, vns.splice(req.params.oldIndex, 1)[0]);
    res.json(vns);
});

app.post('/api/vns/sort/:state/:field', function (req, res) {
    var state = req.params.state;
    var field = req.params.field;
    vns.sort(function (a, b) {
        if (field == "date") {
            var d1 = Date.parse(a[field]);
            var d2 = Date.parse(b[field]);
            if (state == "asc")
                return d1 > d2;
            else return d1 < d2;
        } else {
            if (state == "asc")
                return a[field] > b[field];
            else return a[field] < b[field];
        }
    });
    res.json(vns);
});

app.post('/api/vns/reset', function (req, res) {
    vns = []
    for (var i in vns_copy) {
        var vn = { title: "t", date: "d", rating: "1" };
        vn.title = vns_copy[i].title;
        vn.date = vns_copy[i].date;
        vn.rating = vns_copy[i].rating;
        vns.push(vn);
    }
    res.json(vns);
});

/* mysql */

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.OPENSHIFT_MYSQL_DB_HOST || '127.0.0.1',
    port: process.env.OPENSHIFT_MYSQL_DB_PORT || 3306,
    user: 'admingthglhl',
    password: 'GpypqKGzdQWP',
    database: 'experiments'
});

connection.connect();

app.get('/helloMySQL', function (req, res) {        
    connection.query('SELECT * from test', function (err, rows, fields) {
        if (err) throw err;
        console.log(rows);
        console.log(fields);        
        res.send(rows[0].str);
    });    
});

app.get('/api/students', function (req, res) {
    connection.query('SELECT * from student', function (err, rows, fields) {
        if (err) throw err;
        res.json(rows);
    });
});

var url = require('url');

app.post('/api/addstudent', function (req, res) {
    var query = url.parse(req.url, true).query;
    connection.query('insert into student SET ?', query,
    function (err, rows, fields) {
        res.json(err);
    });
});

app.get('/api/clubmember', function (req, res) {
    var clubName = url.parse(req.url, true).query.clubName;
    connection.query(
    'select name, major from student where id in (select studentId from attend where clubName = ?)', clubName,
    function (err, rows, fields) {
        res.json(rows);
    });
});

app.get('/api/clubmember2', function (req, res) {
    var clubName = url.parse(req.url, true).query.clubName;
    var Id = [];
    connection.query(
    'select studentId from attend where clubName = ?', clubName,
    function (err, rows, fields) {
        for (var i = 0; i < rows.length; i++) {
            Id.push(rows[i].studentId);
        }      
        var query = connection.query(
        'select name, major from student where id in ('+connection.escape(Id)+')',
        function (err, rows, fields) {
            console.log(err);
            res.json(rows);
        });
        console.log(query.sql);
    });         
});

//connection.end();