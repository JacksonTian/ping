var http = require("http");
var https = require("https");
var config = require("./config");

exports.createServer = function (framework, options) {
    options = options || config.secure;
    var server = options ? https.createServer(options) : http.createServer();
    server.on("request", function (request, response) {
        framework.dispatch(request, response);
    });

    return server;
};
