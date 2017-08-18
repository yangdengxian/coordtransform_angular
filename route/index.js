var express = require('express');
var fs = require('fs');
var path = require('path');
var multipart = require('connect-multiparty');
var router = express.Router();

var multipartMiddleware = multipart();
/* 首页 */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'index' });
});

router.get('/readFile', function(req, res, next) {
    var filePath = req.query.filePath;
    fs.readFile(path.join(__dirname, '../' + filePath), { encoding: 'utf-8' }, function(err, bytesRead) {
        if (err) throw err;
        var data = JSON.parse(bytesRead);
        console.log("readFile success");
        res.send(data);
    });
});

router.post('/writeFile', function(req, res) {
    var data = req.body.insertSql;
    var dirpath = path.join(__dirname, '../testFile');
    //先判断文件夹是否存在，不存在，先创建
    if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
    }
    writeFile();

    function writeFile() {
        fs.writeFile(path.join(__dirname, '../testFile/data.sql'), data, { encoding: 'utf-8' }, function(err) {
            if (err) throw err;
            console.log("Export Account Success!");
        });
    }

});

//此处'/url'应与angular发送的路由一致，
router.post('/uploadFiles', multipartMiddleware, function(req, res, next) {
    var profile_image = req.files.file;
    var tmp_path = profile_image.path; //此处为页面图片存放的地址，在C盘的临时文件夹temp下。   
    var dirpath = path.join(__dirname, '../testFile');
    if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
    }
    var filePath = path.join(__dirname, '../testFile/' + profile_image.name); //此处'./url'为上传的文件希望存放的地址.可以为绝对地址
    tmp_path = "d:\\data.json";
    //跨域传递文件
    var is = fs.createReadStream(tmp_path);
    var os = fs.createWriteStream(filePath);
    is.pipe(os);
    is.on('end', function() {
        fs.unlinkSync(tmp_path);
    });
    //跨域传递文件
    //-----------此处可以写点传递回前台的数据   --------此处不完整，不能完全照搬。如果写全的话，太麻烦。
});
module.exports = router;