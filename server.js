var http = require("http");
var url = require("url");
var qs = require("querystring");
var cookie = require("./cookie");
var session = require("./session");
var config = require("./config");

var sessionManager = new session.SessionManager(config.Timeout);

var server = http.createServer(function (request, response) {

    if (request.url == "/favicon.ico") {
        response.writeHead(404, "Not Found");
        response.end();
        return;
    }
    var handle = function (session) {
        response.setHeader("Content-Type", "text/plain");
        response.writeHead(200, "Ok");
        if (!session.get("username")) {
            session.set("username", request.get("username"));
        }
        response.write("Hi, " + session.get("username") + "\n\r");
        response.end();
    };

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

    var sessionId = request.cookie(session.SESSIONID_KEY);
    console.log(_cookieMap);
    var curSession;
    if (sessionId && (curSession = sessionManager.get(sessionId))) {
        if (sessionManager.isTimeout(curSession)) {
            sessionManager.remove(sessionId);
            curSession = sessionManager.renew(response);
        } else {
            curSession.updateTime();
        }
    } else {
        curSession = sessionManager.renew(response);
    }

    var _urlMap;
    request.get = function (key) {
        if (!_urlMap) {
            _urlMap = url.parse(request.url, true);
        }
        return _urlMap.query[key];
    };
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
            handle(curSession);
        });
    } else {
        handle(curSession);
    }
});

server.listen(8000);
