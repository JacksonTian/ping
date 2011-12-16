var util = require("util");
var path = require("path");
var fs = require("fs");
var EventProxy = require("eventproxy").EventProxy;
var footprint = require("footprint");

var PortalView = function () {
    EventProxy.call(this);
    this.ajaxSeq = [];
    this.partialViews = {};
    this.partialSeq = [];
    this.pipeSeq = [];
    this.pipes = [];
};
util.inherits(PortalView, EventProxy);

/**
 * Put partial view into sequence. Replace call with view name in template.
 * After preprocess phase, portal will get all partial views through this sequence.
 * The view name will be replaced in postprocess phase.
 */
PortalView.prototype.partial = function (viewName, data) {
    data = data || this.viewData;
    this.partialSeq.push({"viewName": viewName, "viewData": data});
    return "<%=" + viewName + "%>";
};

/**
 * Put ajax call into sequence. These scripts will were outputed after all partial views outputed.
 */
PortalView.prototype.ajax = function (viewName, data) {
    var script = '<script>\nPortal.fire("' + viewName + '", ' + JSON.stringify(data) + ');\n</script>';
    this.ajaxSeq.push(script);
    return "";
};

/**
 * Put pipe call into sequence. Trigger these calls after preprocess phase.
 */
PortalView.prototype.bigPipe = function (viewName, data) {
    this.pipeSeq.push({"viewName": viewName, "viewData": data});
    return "";
};

/**
 * 
 */
PortalView.prototype.getPartial = function (data) {
    var that = this;
    var viewPath = path.join("partials", data.viewName + ".view");
    fs.readFile(viewPath, function (err, view) {
        if (err) {
            throw err;
        } else {
            console.log(data.viewData);
            var html = footprint.template(view.toString("utf-8"), data.viewData);
            that.partialViews[data.viewName] = html;
            that.fire("partial_end", html);
        }
    });
};

PortalView.prototype.getPartials = function () {
    var that = this;
    this.partialSeq.forEach(function (val) {
        that.getPartial(val);
    });
};


PortalView.prototype.getPipe = function (data) {
    var that = this;
    this.model.pipe(data, function (content) {
        var script = '<script>\nPortal.bigPipe("' + data.viewName + '", "' + content + '");\n</script>';
        that.pipes.push(script);
        that.fire("pipe_end", script);
    });
};

PortalView.prototype.getPipes = function () {
    var that = this;
    this.pipeSeq.forEach(function (val) {
        that.getPipe(val);
    });
};

PortalView.prototype.processAjax = function (response) {
    this.ajaxSeq.forEach(function (script) {
        response.write(script);
    });
};
/**
 * @description 
 */
PortalView.prototype.processPipes = function (response) {
    // Process sequnences
    this.pipes.forEach(function (script) {
        response.write(script);
    });

    // Process coming pipes.
    var times = this.pipeSeq.length - this.pipes.length;
    this.on("pipe_end", function (script) {
        response.write(script);
    });

    this.after("pipe_end", times, function () {
        console.log("Complete.");
        response.end();
    });
};

exports.PortalView = PortalView;