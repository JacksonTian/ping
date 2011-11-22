var http = require("http");
var url = require("url");

var Framework = function () {
    
};

Framework.prototype.handle = function (request, response) {
    var routeInfo = this.route(request.url);
    try {
        var controller = require('../controllers/' + routeInfo.controller).controller;
    } catch (ex) {
        
    }
    // Add get parse supports
    var _urlMap;
    request.get = function (key) {
        if (!_urlMap) {
            _urlMap = url.parse(request.url, true);
        }
        return _urlMap.query[key];
    };

    // Add post parse supports
    if (request.method === "POST") {
        var _postData = "",
            _postMap = "";

        request.on('data', function (chunk) {
            _postData += chunk;
        })
        .on("end", function () {
            request.postData = _postData;
            request.post = function (key) {
                if (!_postMap) {
                    _postMap = qs.parse(_postData);
                }
                return _postMap[key];
            };
        });
    }

    // Add cookie parse and set supports
    var _cookieMap;
    request.cookie = function (key) {
        if (!_cookieMap) {
            _cookieMap = cookie.parse(request.headers.cookie || "");
        }
        return _cookieMap[key];
    };
    var _setCookieMap = {};
    response.setCookie = function (cookieObj) {
        _setCookieMap[cookieObj.key] = cookie.stringify(cookieObj);
        var returnVal = [];
        for(var key in _setCookieMap) {
            returnVal.push(_setCookieMap[key]);
        }

        response.setHeader("Set-Cookie", returnVal.join(", "));
    };
};

Framework.prototype.route = function (url) {
    // url: /controller/action/parameter1/parameter2
    var pathname = url.parse(url).pathname;

    var path = pathname.split("/");
    path.shift(); // Remove the first "/"

    return {
        controller: path[0] || "index",
        action: path[1] || "index",
        args: path.slice(2) || [],
    };
};

var framework = new Framework();

var server = http.createServer(function (request, response) {
    framework.handle(request, response);
});

server.listen(8000);
