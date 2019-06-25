**项目介绍**
1. 百度bd09坐标系、gcj02和wgs84坐标互转；
2. 结果展示；
3. 经纬度平面坐标互转（proj4）
4. 项目启动 
	**`npm install`**
	**`npm start`**
5. 该项目nodejs编写，可支持Get和Post请求
6. 需要郑重声明，bd09，gcj02，wgs84互转并不算坐标系转换，合理地表达应为--纠偏和解码校正，三者wkid同为4326，属于同一坐标系；proj4所做工作为不同坐标系的互转，比如：西安80坐标系转北京54坐标系，或者转WGS84坐标系。之前很多同事在这块有些迷惑，在此解答一下。


**使用方法**
1. 百度转火星坐标系请求，参数
http://localhost:3000/transRequest/BD09ToGCJ02?lon=104.081529&lat=30.607295
2. 火星转WGS84
http://localhost:3000/transRequest/GCJ02ToWGS84?lon=104.081529&lat=30.607295
3. 百度转WGS84
http://localhost:3000/transRequest/BD09ToWGS84?lon=104.081529&lat=30.607295
4. WGS84转火星
http://localhost:3000/transRequest/WGS84ToGCJ02?lon=104.081529&lat=30.607295
5. WGS84转百度
http://localhost:3000/transRequest/WGS84ToBD09?lon=104.081529&lat=30.607295
6. proj4坐标系转换
http://localhost:3000/transRequest/proj4Transform?fromWkid=4326&toWkid=3857&coordinate=104.0790005,30.60972
7. 成功结果展示
```json
{
	"code":"0",
	"msg":"操作成功",
	"data":{
		"x":11586021.337932866,
		"y":3582166.908020966,
		"wkid":"3857"
		}
	}
```
**项目完成功能**
1. 文件上传；
2. 文件读写；
3. 查询结果excel导出；
4. 文件读取结果展示；
5. 百度bd09坐标系、gcj02和wgs84坐标互转；
6. nodejs request GET和POST方式请求处理。

**项目剩余优化**
1. 数据文件上传，数据入库；
2. 数据库选型，初步决定采用mysql，也可使用mongodb（本人不太熟悉），oracle太过于笨重和复杂；
3. nodejs进行数据的查询和数据服务接口开发和调试；
4. 前端调用nodejs数据接口，数据的展示；
5. 前端样式优化；
6. 系统的代码优化和扩展性维护；
7. 查询结果excel导出优化。
8. 界面优化

**项目bug剩余**
1. 本地文件上传，完整路径获取，暂时写死一个文件路径，后续修改；

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

**其他网站坐标转换链接**
http://epsg.io/transform#s_srs=21420&t_srs=21417
