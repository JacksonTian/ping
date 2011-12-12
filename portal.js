var ping = require("./ping");
var url = require("url");
var path = require("path");
var fs = require("fs");
var vm = require("vm");
var util = require("util");
var EventProxy = require("eventproxy").EventProxy;
var Asset = require("./asset").Asset;

var Portal = function () {
};
Portal.extension = ".portal";
Portal.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
};
var PortalView = function () {
    EventProxy.call(this);
    this.ajaxSeq = [];
    this.partialViews = {};
    this.partialSeq = [];
    this.pipeSeq = [];
    this.pipes = [];
    var that = this;
    this.on("partial", function (data) {
        var viewPath = path.join("partials", data.viewName + ".view");
        fs.readFile(viewPath, function (err, view) {
            if (err) {
                throw err;
            } else {
                that.partialViews[data.viewName] = view.toString("utf-8");
                that.fire("partial_end", view.toString("utf-8"));
            }
        });
    });

    this.on("pipe", function (data) {
        that.model.pipe(data.viewName, data.viewData, function (content) {
            var script = '<script>\nPortal.bigPipe("' + data.viewName + '", "' + content + '");\n</script>';
            that.pipes.push(script);
            that.fire("pipe_end", script);
        });
    });
};
util.inherits(PortalView, EventProxy);
PortalView.prototype.partial = function (viewName, data) {
    console.log(arguments);
    this.partialSeq.push({"viewName": viewName, "viewData": data});
    return "<%=" + viewName + "%>";
};

PortalView.prototype.ajax = function (viewName, data) {
    var script = '<script>\nPortal.fire("' + viewName + '", ' + JSON.stringify(data) + ');\n</script>';
    this.ajaxSeq.push(script);
    return "";
};

PortalView.prototype.bigPipe = function (viewName, data) {
    data = "BigPipe rendered."
    this.pipeSeq.push({"viewName": viewName, "viewData": data});
    return "";
};
PortalView.prototype.ignitePartials = function () {
    var that = this;
    this.partialSeq.forEach(function (val) {
        that.fire("partial", val);
    });
};

PortalView.prototype.ignitePipes = function () {
    var that = this;
    this.pipeSeq.forEach(function (val) {
        that.fire("pipe", val);
    });
};
PortalView.prototype.processAjax = function (response) {
    this.ajaxSeq.forEach(function (val) {
        response.write(val);
    });
};
PortalView.prototype.processPipes = function (response) {
    // Process sequnences
    var times = this.pipeSeq.length - this.pipes.length;
    console.log(times);
    this.pipes.forEach(function (script) {
        response.write(script);
    });
    // Process coming pipes.
    this.on("pipe_end", function (script) {
        response.write(script);
    });
    this.after("pipe_end", times, function () {
        console.log("Complete.");
        response.end();
    });
};

Portal.preParse = function (str, sandbox, settings) {
    var c  = settings || Portal.templateSettings;
    var temp = str.replace(c.interpolate, function (match, code) {
        return sandbox.viewData[code] ? sandbox.viewData[code] : "The key " + code + " is undefined.";
    }).replace(c.evaluate, function (match, code) {
        console.log(code);
        var result = vm.runInNewContext(code, sandbox);
        console.log(result);
        return result;
    });

    return temp;
};

Portal.postParse = function (str, sandbox, settings) {
    var c  = settings || Portal.templateSettings;
    var temp = str.replace(c.interpolate, function (match, code) {
        return sandbox[code] ? sandbox[code] : "The key " + code + " is undefined.";
    });

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
    var pathname = portal + Portal.extension;
    var realPath = path.join("portals", path.normalize(pathname.replace(/\.\./g, "")));
    console.log(realPath);

    var portalView = new PortalView();
    console.log(portalView);

    portalView.all("before", "file", function (viewData, file) {
        console.log("Ready!");
        var sandbox = {
                "view": portalView,
                "viewData": viewData
            };
        var preParsed = Portal.preParse(file, sandbox);
        console.log("Pre processed.");

        portalView.after("partial_end", portalView.partialSeq.length, function () {
            response.writeHead(200);
            response.write(Portal.postParse(preParsed, portalView.partialViews));
            portalView.fire("render_phase1_done");
        });

        portalView.ignitePartials();
        portalView.ignitePipes();

        console.log("Ignited all async view.");
    });
    
    portalView.on("render_phase1_done", function () {
        console.log("Render_phase1_done");
        portalView.processAjax(response);
        portalView.processPipes(response);
    });

    try {
        var model = new require("./models/" + portal);
        portalView.model = model;
        model.before(function (viewData) {
            portalView.fire("before", viewData);
        });
    } catch (ex) {
        response.writeHead(500);
        response.write(ex.stack);
        response.end("\n");
    }

    fs.readFile(realPath, function (err, file) {
        if (err) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write("This request URL " + pathname + " was not found on this server.\n");
            response.end();
        } else {
            portalView.fire("file", file.toString("utf-8"));
        }
    });

};

var portal = new Portal();
ping.createServer(portal).listen(8000);
console.log("Portal server is running at 8000 port.");

// Static file server.
var asset = new Asset();
ping.createServer(asset).listen(8001);
console.log("Static file server is running at 8001 port.");

