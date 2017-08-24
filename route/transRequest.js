var express = require("express");
var router = express.Router();
var transformService = require("../service/transformService");
/**
 * 火星坐标系转GPS坐标
 */
router.get('/GCJ02ToWGS84', function(req, res, next) {
    var lon = req.query.lon,
        lat = req.query.lat;
    transformService.gcj02towgs84(lon, lat, res);
});

/**
 * GPS坐标转火星坐标系
 */
router.get('/WGS84ToGCJ02', function(req, res, next) {
    var lon = req.query.lon,
        lat = req.query.lat;
    transformService.gcj02towgs84(lon, lat, res);
});

/**
 * 百度坐标系转火星坐标系
 */
router.get('/BD09ToGCJ02', function(req, res, next) {
    var lon = req.query.lon,
        lat = req.query.lat;
    transformService.bd09togcj02(lon, lat, res);
});

/**
 * 火星坐标系转百度坐标系
 */
router.get('/GCJ02ToBD09', function(req, res, next) {
    var lon = req.query.lon,
        lat = req.query.lat;
    transformService.gcj02towgs84(lon, lat, res);
});

/**
 * GPS坐标系或者天地图坐标系转百度坐标系
 */
router.get('/WGS84ToBD09', function(req, res, next) {
    var lon = req.query.lon,
        lat = req.query.lat;
    transformService.gcj02towgs84(lon, lat, res);
});

/**
 * 百度坐标系转GPS坐标系或者天地图坐标系
 */
router.get('/BD09ToWGS84', function(req, res, next) {
    var lon = req.query.lon,
        lat = req.query.lat;
    transformService.gcj02towgs84(lon, lat, res);
});

module.exports = router;