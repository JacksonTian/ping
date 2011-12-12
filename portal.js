var url = require("url");
var path = require("path");
var fs = require("fs");
var vm = require("vm");
var PortalView = require("./portalview").PortalView;

var Portal = function () {
};
Portal.extension = ".portal";
Portal.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
};

Portal.preprocess = function (str, sandbox, settings) {
    var c  = settings || Portal.templateSettings;
    var temp = str.replace(c.interpolate, function (match, code) {
        return sandbox.viewData[code] ? sandbox.viewData[code] : "The key " + code + " is undefined.";
    }).replace(c.evaluate, function (match, code) {
        //console.log(code);
        var result = vm.runInNewContext(code, sandbox);
        //console.log(result);
        return result;
    });

    return temp;
};

Portal.postprocess = function (str, sandbox, settings) {
    var c  = settings || Portal.templateSettings;
    var temp = str.replace(c.interpolate, function (match, code) {
        return sandbox[code] ? sandbox[code] : "The key " + code + " is undefined.";
    });

    return temp;
};
Portal.prototype.route = function (requestUrl) {
    var portal = requestUrl.split("/")[1];
    var pathname = portal + Portal.extension;
    var realPath = path.join("portals", path.normalize(pathname.replace(/\.\./g, "")));
    return {
        "portal": portal,
        "path": realPath
    };
};
Portal.prototype.dispatch = function (request, response) {
    if (request.url == "/favicon.ico") {
        response.writeHead(404);
        response.end();
        return;
    }

    var routeInfo = this.route(request.url);

    var portalView = new PortalView();
    portalView.all("before", "file", function (viewData, file) {
        console.log("Portal ready.");
        var sandbox = {
                "view": portalView,
                "viewData": viewData
            };

        var preprocessed = Portal.preprocess(file, sandbox);

        portalView.after("partial_end", portalView.partialSeq.length, function () {
            response.writeHead(200);
            response.write(Portal.postprocess(preprocessed, portalView.partialViews));
            console.log("Postprocess done.");
            portalView.fire("postprocess_done");
        });

        portalView.getPartials();
        portalView.getPipes();

        console.log("Preprocess done.");
    });

    portalView.on("postprocess_done", function () {
        portalView.processAjax(response);
        portalView.processPipes(response);
    });

    try {
        var model = new require("./models/" + routeInfo.portal);
        portalView.model = model;
        model.before(function (viewData) {
            portalView.fire("before", viewData);
        });
    } catch (ex) {
        response.writeHead(500);
        response.write(ex.stack);
        response.end("\n");
    }

    fs.readFile(routeInfo.path, function (err, file) {
        if (err) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write("This request URL " + pathname + " was not found on this server.\n");
            response.end();
        } else {
            portalView.fire("file", file.toString("utf-8"));
        }
    });

};

exports.Portal = Portal;
