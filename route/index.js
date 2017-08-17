var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();


/* 首页 */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'index' });
});

router.get('/readFile', function(req, res, next) {
    var filePath = req.query.filePath;
    fs.readFile(path.join(__dirname, '../public/' + filePath), { encoding: 'utf-8' }, function(err, bytesRead) {
        if (err) throw err;
        var data = JSON.parse(bytesRead);
        console.log("readFile success");
        res.send(data);
    });
});

/* router.get('/writeFile', function(req, res, next) {
    var data = req.query.insertSql;
    fs.writeFile(path.join(__dirname, '../testFile/data.sql'), data, { encoding: 'utf-8' }, function(err) {
        if (err) throw err;
        console.log("Export Account Success!");
    });
}); */



module.exports = router;