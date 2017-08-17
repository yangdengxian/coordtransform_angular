/**
 * 依赖的模块，require相当于java，python的import
 */
var app = require('./app'); //app.js
var debug = require('debug')('blog:server');
var http = require('http');

/**
 * 获取应用的端口号
 */
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * 创建HttpServer
 */
var server = http.createServer(app);

/**
 * 监听端口号
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * 初始化端口号
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}