// 向前台返回JSON方法的简单封装
var jsonWrite = function(res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    } else {
        res.json({
            code: '0',
            msg: '操作成功',
            data: ret
        });
    }
};

var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;

var commonFuns = {
    transformlat: function(lng, lat) {
        lat = +lat;
        lng = +lng;
        var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
        return ret;
    },

    transformlng: function(lng, lat) {
        lat = +lat;
        lng = +lng;
        var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
        return ret;
    },

    /**
     * 判断是否在国内，不在国内则不做偏移
     * @param lng
     * @param lat
     * @returns {boolean}
     */
    out_of_china: function(lng, lat) {
        lat = +lat;
        lng = +lng;
        // 纬度3.86~53.55,经度73.66~135.05 
        return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
    },

    /** 
     * Return a linestring feature given a linestring WKT fragment. 
     * @param {String} str A WKT fragment representing the linestring 
     * @returns {OpenLayers.Feature.Vector} A linestring feature 
     * @private 
     */
    linestring: function(addRessArray) {
        var points = addRessArray;
        var components = [];
        var lineStr = "LINESTRING  (";
        for (var i = 0, len = points.length; i < len; ++i) {
            lineStr += points[i][0] + " " + points[i][1] + ","
        }
        lineStr = lineStr.substring(0, lineStr.lastIndexOf(","));
        lineStr += ")";
        return lineStr; //new esri.geometry.Polyline(components);  
    }
};

module.exports = {
    response: function(res, obj, jsonp) {
        var retCode = {
            SUCCESS: 1,
            ERROR: -1
        };

        var result = {};

        if (res.statusCode == 200) {
            result.data = obj;
            result.retCode = retCode.SUCCESS;
        } else {
            result = obj;
            result.retCode = retCode.ERROR;
        }

        result.status = res.statusCode;

        if (jsonp) {
            return res.send(jsonp + "(" + JSON.stringfy(result) + ")");
        } else {
            return res.json(result);
        }
    },
    bd09towgs84: function(addressJson) {
        var addRessArray = [];
        addressJson.forEach(function(addressObj) {
            var gcjO2Array = commonFuns.bd09togcj02(addressObj["lng"], addressObj["lat"]);
            addRessArray.push(commonFuns.gcj02towgs84(gcjO2Array[0], gcjO2Array[1]));
        });
        return jsonWrite(addRessArray);
    },
    bd09togcj02: function(lon, lat, res) {
        var bd_lon = +lon;
        var bd_lat = +lat;
        var x = bd_lon - 0.0065;
        var y = bd_lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
        var gg_lng = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        return jsonWrite(res, { "lon": gg_lng, "lat": gg_lat });
    },
    gcj02towgs84: function(lng, lat, res) {
        lng = +lng;
        lat = +lat;
        if (commonFuns.out_of_china(lng, lat)) {
            return [lng, lat];
        } else {
            var dlat = commonFuns.transformlat(lng - 105.0, lat - 35.0);
            var dlng = commonFuns.transformlng(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * PI;
            var magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return jsonWrite(res, { "lon": lng * 2 - mglng, "lat": lat * 2 - mglat });
        }
    }
}