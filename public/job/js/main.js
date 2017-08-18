(function(window, angular) {
    var app = angular.module('myApp', ['ngFileUpload']);
    app.controller('coordtransformCtrl', ['$scope', '$http', 'transformService', 'exportExcelService', 'Upload',
        function($scope, $http, transformService, exportExcelService, Upload) {
            require([
                "esri/map",
                "esri/graphic",
                "esri/geometry/Point",
                "esri/geometry/Polyline",
                "esri/SpatialReference",
                "esri/layers/FeatureLayer",
                "esri/urlUtils",
                "esri/geometry/geometryEngine",
                "dojo/on",
                "dojo/domReady!"
            ], function(
                Map, Graphic, Point, Polyline, SpatialReference, FeatureLayer, urlUtils, geometryEngine
            ) {
                //唯一值id
                $scope.uniqueId = "";
                //道路信息数组
                $scope.roadArray = [];
                $scope.transSystem = function() {
                    var iunsertStr = "",
                        filePath = "/job/json/data.json",
                        dataJson;
                    $scope.roadArray = [];
                    $http.get("../readFile?filePath=" + filePath).success(function(res) {
                        dataJson = res;
                        if (dataJson) {
                            if ($scope.uniqueId) {
                                dataJson.forEach(function(dataObj) {
                                    var carRoutePlanId = "" + dataObj["carRoutePlanId"];
                                    //输入唯一值ID ，根据id查询结果，支持模糊查询
                                    if (carRoutePlanId.indexOf($scope.uniqueId) > -1) {
                                        arcgisFeatureSave(dataObj);
                                        //获取insert语句
                                        iunsertStr = getInsertSql(dataObj, iunsertStr);
                                    }

                                });
                            } else {
                                dataJson.forEach(function(dataObj) {
                                    //无唯一值，查询所有值
                                    arcgisFeatureSave(dataObj);
                                    //获取insert语句
                                    iunsertStr = getInsertSql(dataObj, iunsertStr);
                                });
                            }
                            submitPost('../writeFile', { insertSql: iunsertStr });
                        }
                    });
                };
                /**
                 * excel导出
                 */
                $scope.tableToExcel = function(tableId, tableName) {
                    exportExcelService.tableToExcel(tableId, tableName);
                };
                //上传文件
                $scope.submit = function() {
                    fileUpload($scope.file);
                };
                /**
                 * post提交
                 * @param {*} url 
                 * @param {*} params 
                 */
                function submitPost(url, params) {
                    //jquery isExist?
                    if (!jQuery) {
                        return;
                    }
                    var form = '<form id="submitFormData" action="' + url + '" method="post" display="none">';
                    for (var key in params) {
                        if (params.hasOwnProperty(key)) {
                            if (typeof(params[key]) == 'string') {
                                form += '<input type="text" name="' + key + '" value="' + params[key] + '">';
                            } else if (typeof(params[key]) == 'function' || typeof(params[key]) == 'object') {
                                form += '<input type="text" name="' + key + '" value="' + JSON.stringify(params[key]) + '">';
                            }
                        }
                    }
                    form += '<input type="submit" value="Submit">';
                    form += '</form>';
                    $("body").append(form);
                    $("#submitFormData").submit();
                }
                /**
                 * 文件上传
                 * @param {*} file 
                 */
                function fileUpload(file) {
                    $scope.fileInfo = file;
                    Upload.upload({
                        url: "",
                        data: { userName: $scope.userName },
                        file: file
                    }).progress(function(evt) {
                        //进度条
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
                    }).success(function(data, status, headers, config) {
                        //上传成功
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        $scope.uploadImg = data;
                    }).error(function(data, status, headers, config) {
                        //上传失败
                        console.log('error status: ' + status);
                    });
                }
                /**
                 * 获取insertSql
                 * @param {*} dataObj 
                 * @param {*} iunsertStr 
                 */
                function getInsertSql(dataObj, iunsertStr) {
                    var systemArray = {},
                        wgs84Array = [],
                        lineStr = "";
                    if (dataObj["workRoutePosition"]) {
                        systemArray = JSON.parse(dataObj["workRoutePosition"]);
                        wgs84Array = transformService.bd09towgs84(systemArray);
                        lineStr = transformService.linestring(wgs84Array);
                    }
                    iunsertStr += "INSERT INTO CRWORK_ROAD (OBJECTID,GEOID, ORGID, SHAPE) VALUES(" + parseInt(Math.random() * 10 + 100000) + "," +
                        "'" + dataObj["carRoutePlanId"] + "','" + dataObj["orgId"];
                    if (lineStr) {
                        iunsertStr += "',SDE.st_geometry ('" + lineStr + "',4326));\n";
                    } else {
                        iunsertStr += "',NULL);\n";
                    }
                    return iunsertStr;
                }
                /**
                 * 获取道路信息
                 * @param {*} lineJson 
                 * @param {*} attributes 
                 */
                function arcgisFeatureSave(attributes) {
                    var polyline = {},
                        graphic = {},
                        lenJson = {},
                        roadLen = 0;
                    if (attributes["workRoutePosition"]) {
                        var jsonObj = {
                                "paths": [
                                    []
                                ],
                                "spatialReference": {
                                    "wkid": 4326
                                }
                            },
                            systemArray = JSON.parse(attributes["workRoutePosition"]),
                            wgs84Array = transformService.bd09towgs84(systemArray);


                        wgs84Array.forEach(function(wgs84Obj) {
                            jsonObj.paths[0].push([wgs84Obj[0], wgs84Obj[1]]);
                        });

                        polyline = new Polyline(jsonObj);
                        graphic = new Graphic(polyline, null, null, null);
                        graphic.setAttributes({ "GEOID": attributes["carRoutePlanId"], "ORGID": attributes["orgId"] });

                        roadLen = geometryEngine.geodesicLength(polyline, "kilometers");
                    } else {
                        roadLen = null;
                    }

                    lenJson["carRoutePlanId"] = "" + attributes["carRoutePlanId"];
                    lenJson["orgId"] = "" + attributes["orgId"];
                    lenJson["roadLen"] = roadLen;
                    $scope.roadArray.push(lenJson);
                }
            });
        }
    ]);
    /**
     * 坐标转换服务
     */
    app.factory('transformService', function() {
        var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
        var PI = 3.1415926535897932384626;
        var a = 6378245.0;
        var ee = 0.00669342162296594323;
        var commonFuns = {
            // addressJson: [{ "lng": 117.304921, "lat": 32.987901 }, { "lng": 117.304526, "lat": 32.984978 }, { "lng": 117.304095, "lat": 32.981889 }, { "lng": 117.311676, "lat": 32.981132 }, { "lng": 117.318284, "lat": 32.980428 }, { "lng": 117.324429, "lat": 32.979974 }, { "lng": 117.324573, "lat": 32.982851 }, { "lng": 117.324429, "lat": 32.979943 }, { "lng": 117.343545, "lat": 32.981034 }, { "lng": 117.324393, "lat": 32.980004 }, { "lng": 117.32468, "lat": 32.969585 }, { "lng": 117.324546, "lat": 32.976559 }, { "lng": 117.321932, "lat": 32.976778 }, { "lng": 117.324546, "lat": 32.976559 }, { "lng": 117.333079, "lat": 32.977112 }, { "lng": 117.342997, "lat": 32.977748 }, { "lng": 117.333088, "lat": 32.977112 }, { "lng": 117.324546, "lat": 32.976551 }, { "lng": 117.324465, "lat": 32.976915 }, { "lng": 117.324447, "lat": 32.978066 }, { "lng": 117.324429, "lat": 32.979974 }, { "lng": 117.318356, "lat": 32.980428 }, { "lng": 117.318967, "lat": 32.988575 }, { "lng": 117.317674, "lat": 32.969797 }, { "lng": 117.31832, "lat": 32.980398 }, { "lng": 117.311673, "lat": 32.981125 }, { "lng": 117.312392, "lat": 32.987484 }, { "lng": 117.310272, "lat": 32.969191 }, { "lng": 117.311673, "lat": 32.981125 }, { "lng": 117.308011, "lat": 32.981586 }, { "lng": 117.304095, "lat": 32.981874 }, { "lng": 117.304077, "lat": 32.981632 }, { "lng": 117.302927, "lat": 32.972122 }, { "lng": 117.302783, "lat": 32.969971 }, { "lng": 117.302783, "lat": 32.968456 }],
            bd09towgs84: function(addressJson) {
                var addRessArray = [];
                addressJson.forEach(function(addressObj) {
                    var gcjO2Array = commonFuns.bd09togcj02(addressObj["lng"], addressObj["lat"]);
                    addRessArray.push(commonFuns.gcj02towgs84(gcjO2Array[0], gcjO2Array[1]));
                });
                return addRessArray
            },
            bd09togcj02: function(lon, lat) {
                var bd_lon = +lon;
                var bd_lat = +lat;
                var x = bd_lon - 0.0065;
                var y = bd_lat - 0.006;
                var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
                var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
                var gg_lng = z * Math.cos(theta);
                var gg_lat = z * Math.sin(theta);
                return [gg_lng, gg_lat];
            },
            gcj02towgs84: function(lng, lat) {
                var lng = +lng;
                var lat = +lat;
                if (commonFuns.out_of_china(lng, lat)) {
                    return [lng, lat]
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
                    return [lng * 2 - mglng, lat * 2 - mglat];
                }
            },

            transformlat: function(lng, lat) {
                var lat = +lat;
                var lng = +lng;
                var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
                ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
                ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
                ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
                return ret;
            },

            transformlng: function(lng, lat) {
                var lat = +lat;
                var lng = +lng;
                var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
                ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
                ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
                ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
                return ret
            },

            /**
             * 判断是否在国内，不在国内则不做偏移
             * @param lng
             * @param lat
             * @returns {boolean}
             */
            out_of_china: function(lng, lat) {
                var lat = +lat;
                var lng = +lng;
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
                return lineStr //new esri.geometry.Polyline(components);  
            }
        };

        /* for (var key in commonFuns) {
        	if (commonFuns.hasOwnProperty(key)) {
        		$rootScope[key] = commonFuns[key];			
        	}
        } */

        return commonFuns;
    });
    /**
     * excel导出服务
     */
    app.factory('exportExcelService', function($rootScope) {
        var exportExcelService = {};
        exportExcelService.tableToExcel = (function() {
            var uri = 'data:application/vnd.ms-excel;base64,',
                template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><?xml version="1.0" encoding="UTF-8" standalone="yes"?><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
                base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) },
                format = function(s, c) {
                    return s.replace(/{(\w+)}/g,
                        function(m, p) { return c[p]; })
                }
            return function(table, name) {
                if (!table.nodeType) table = document.getElementById(table)
                var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
                window.location.href = uri + base64(format(template, ctx))
            }
        })();

        return exportExcelService;
    });
    /**
     * 后台请求服务
     */
    app.service('requestService', ['$http', '$rootScope', '$q',
        function($http, $rootScope, $q) {
            //isLoading - set loading image when waiting for a response, default is false,
            var postRequest = function(path, data) {
                var deferred = $q.defer();
                $http({
                    method: 'POST',
                    url: path,
                    data: data,
                    async: true,
                    xhrFields: {
                        withCredentials: false,
                        useDefaultXhrHeader: false
                    },
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    transformRequest: function(obj) {
                        return $.param(obj);
                    }
                }).then(function(response) {
                    //10000代表未登录
                    deferred.resolve(response.data);
                }, function(response) {
                    alert('操作失败');
                });
                return deferred.promise;

            };

            return {
                post: postRequest
            };

        }
    ]);
})(window, angular)