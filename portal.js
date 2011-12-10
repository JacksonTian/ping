var ping = require("./ping");
var url = require("url");
var path = require("path");
var fs = require("fs");
var EventProxy = require("eventproxy").EventProxy;

var Portal = function () {
};
Portal.extension = ".portal";
Portal.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
};

Portal.parse = function (str, data, settings) {
    var c  = settings || Portal.templateSettings;
    var temp = str.replace(c.interpolate, function(match, code) {
        console.log(arguments);
        return data[code] ? data[code] : match;
    }).replace(c.evaluate, function(match, code) {
        // TODO
        return match;
    });
    console.log(temp);
    return temp;
};

Portal.prototype.dispatch = function (request, response) {
    if (request.url == "/favicon.ico") {
        response.writeHead(404);
        response.end();
        return;
    }

    var portal = request.url.split("/")[1];
    console.log(portal);
    var pathname = url.parse(request.url).pathname + Portal.extension;
    var realPath = path.join("portals", path.normalize(pathname.replace(/\.\./g, "")));
    console.log(realPath);

    var proxy = new EventProxy();

    proxy.all("before", "view", function (viewData, view) {
        response.writeHead(200);
        response.write(Portal.parse(view, viewData));
        response.end("\n");
    });

    var model = new require("./models/" + portal);
    model.before(function (viewData) {
        proxy.fire("before", viewData);
    });

    fs.readFile(realPath, function (err, view) {
        if (err) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write("This request URL " + pathname + " was not found on this server.\n");
            response.end();
        } else {
            proxy.fire("view", view.toString("utf-8"));
        }
    });
    
};

var portal = new Portal();
var server = ping.createServer(portal);
server.listen(8000);