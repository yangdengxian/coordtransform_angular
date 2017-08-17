angular.module('myApp').service('requestService', ['$http', '$rootScope', '$q',
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