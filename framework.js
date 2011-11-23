var http = require("http");
var url = require("url");
var cookie = require("./cookie");
var session = require("./session");
var config = require("./config");
var path = require("path");
var Context = require("./context").Context;

var Framework = function () {
    this.sessionManager = new session.SessionManager(config.Timeout);
};

Framework.prototype.dispatch = function (request, response) {
    if (request.url == "/favicon.ico") {
        response.writeHead(404, "Not Found");
        response.end();
        return;
    }

    var routeInfo = this.route(request.url);
    var controller;
    try {
        controller = require('./controllers/' + routeInfo.controller);
        var method = request.method.toLowerCase() || 'get';
        var action = controller[method] ? controller[method][routeInfo.action] : null;
        if (action) {
            this.enableGet(request, response);
            this.enableCookie(request, response);
            this.enablePost(request, response);
            var curSession = this.enableSession(request, response);
            // Pass request response session and framework into context object.
            var context = new Context(request, response, curSession, this);
            request.on("end", function () {
                action.apply(context, routeInfo.args);
            });
        } else {
            this.handler500(request, response, 'Error: Controller "' + routeInfo.controller + '" without action "' + routeInfo.action + '" for "' + request.method + '" request.');
        }
    } catch (ex) {
        console.log(ex.message);
        console.log(ex.stack);
        this.handler500(request, response, 'Error: Controller "' + routeInfo.controller + '" dosen\'t exsit.');
    }
};

// Add get parse supports
Framework.prototype.enableGet = function (request, response) {
    var _urlMap;
    request.get = function (key) {
        if (!_urlMap) {
            _urlMap = url.parse(request.url, true);
        }
        return _urlMap.query[key];
    };
};

// Add cookie parse and set supports
Framework.prototype.enableCookie = function (request, response) {
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

// Add post parse supports
Framework.prototype.enablePost = function (request, response) {
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
};

// Add session supports
Framework.prototype.enableSession = function (request, response) {
    var sessionManager = this.sessionManager;
    var sessionId = request.cookie(session.SESSIONID_KEY);

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

    return curSession;
};

Framework.prototype.handler500 = function (request, response, err) {
    response.writeHead(500, {'Content-Type': 'text/plain'});
    response.end(err);
};

Framework.prototype.route = function (requestUrl) {
    // /controller/action/parameter1/parameter2
    var pathname = url.parse(requestUrl).pathname;

    var path = pathname.split("/");
    path.shift(); // Remove the first "/"

    return {
        controller: path[0] || "index",
        action: path[1] || "index",
        args: path.slice(2) || [],
    };
};

exports.Framework = Framework;
